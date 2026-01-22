export const PYTHON_TYPE_MAP = {
    int: "int",
    long: "int",
    float: "float",
    double: "float",
    bool: "bool",
    string: "str",

    "int[]": "List[int]",
    "string[]": "List[str]",
    "bool[]": "List[bool]",

    "int[][]": "List[List[int]]",
    "string[][]": "List[List[str]]",

    void: "None"
};
