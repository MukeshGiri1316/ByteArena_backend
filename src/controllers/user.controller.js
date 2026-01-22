import { getUserSubmissions } from "../services/submissionQuery.service.js";

const getMysubmissions = async (req, res) => {
    const submissions = await getUserSubmissions({
        userId: req.user.id,
        limit: 20
    });

    res.json(submissions);
}

export {
    getMysubmissions
}