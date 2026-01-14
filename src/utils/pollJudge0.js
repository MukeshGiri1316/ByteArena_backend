import { getResult } from "../services/judge0.service.js";

const MAX_RETRIES = 10;      // total attempts
const DELAY_MS = 1000;      // 1 second delay

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function pollJudge0Result(token) {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        const result = await getResult(token);

        if (result.status?.id >= 3) {
            return result;
        }

        await sleep(DELAY_MS);
    }

    throw new Error("Execution timeout");
}
