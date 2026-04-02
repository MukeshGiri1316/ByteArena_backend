import { CPP_TYPE_MAP } from '../typemappings/cpp.js';

const isContainer = (type) =>
    type.endsWith("[]") || type.endsWith("[][]");

const shouldPassByReference = (type, returnType) => {
    // If function returns void → likely in-place
    if (returnType === "void" && isContainer(type)) return true;

    // Large structures → avoid copy
    if (isContainer(type)) return true;

    return false;
};

export function generateCppBoilerplate(functionSignature) {
    const { functionName, returnType, parameters } = functionSignature;

    const params = parameters.map((param) => {
        const cppType = CPP_TYPE_MAP[param.type];

        if (shouldPassByReference(param.type, returnType)) {
            return `${cppType}& ${param.name}`; // ✅ reference
        }

        return `${cppType} ${param.name}`; // ✅ value
    });

    const boilerplate = `${CPP_TYPE_MAP[returnType]} ${functionName}(${params.join(", ")}){
    //Code here

}`;

    return boilerplate;
}

export function generatePythonBoilerplate(functionSignature) {
    const { functionName, returnType, parameters } = functionSignature;

    const params = parameters
        .map((param) => param.name)
        .join(", ");

    const boilerplate = `def ${functionName}(self, ${params}):
    # Code here
    pass`;

    return boilerplate;
}
