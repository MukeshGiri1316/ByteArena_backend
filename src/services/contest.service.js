import {Contest} from '../models/contest.model.js';


export async function getContestById(contestId, session = null) {
    return Contest.findById(contestId, null, {session});
}