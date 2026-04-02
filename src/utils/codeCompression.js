import zlib from "zlib";

export function compressCode(code) {
    return zlib.gzipSync(code);
}

export function decompressCode(buffer) {
    return zlib.gunzipSync(buffer).toString("utf8");
}
