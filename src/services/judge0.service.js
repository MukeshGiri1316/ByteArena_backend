import axios from "axios";
import { getJudge0Config } from "../config/judge0.js";

function createJudge0Client() {
    const config = getJudge0Config();

    return axios.create({
        baseURL: config.baseURL,
        timeout: config.timeout,
        headers: {
            "Content-Type": "application/json"
        }
    });
}

/**
 * Submit code to Judge0
 */
export async function submitCode({ source_code, language_id, stdin = "" }) {
    const judge0Client = createJudge0Client();

    const payload = {
        source_code,
        language_id,
        stdin: "",
        base64_encoded: true
    };

    const response = await judge0Client.post("/submissions", payload);

    return response.data;
}

/**
 * Get submission result from Judge0
 */
export async function getResult(token) {
    const judge0Client = createJudge0Client();

    const response = await judge0Client.get(
        `/submissions/${token}`,
        {
            params: {
                base64_encoded: true,
                fields: "*"   // important
            }
        }
    );

    return response.data;
}

