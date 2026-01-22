export function generateArgList(parameters) {
    return parameters.map(p => p.name).join(", ");
}
