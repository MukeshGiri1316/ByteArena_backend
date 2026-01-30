import { CPP_TYPE_MAP } from '../typemappings/cpp.js';

export function generateCppBoilerplate(functionSignature) {
    const { functionName, returnType, parameters } = functionSignature;

    const params = parameters.map((param) => {
        return `${CPP_TYPE_MAP[param.type]} ${param.name}`;
    })

    const boilerplate = `${CPP_TYPE_MAP[returnType]} ${functionName}(${params.join(", ")}){
    //Code here

    }`

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
