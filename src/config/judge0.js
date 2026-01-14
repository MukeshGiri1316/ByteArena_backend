export function getJudge0Config() {
    if (!process.env.JUDGE0_BASE_URL) {
        throw new Error("JUDGE0_BASE_URL is not defined");
    }

    return {
        baseURL: process.env.JUDGE0_BASE_URL,
        timeout: 10000
    };
}
