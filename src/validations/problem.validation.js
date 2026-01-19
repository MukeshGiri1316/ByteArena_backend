import Joi from "joi";

export const createProblemSchema = Joi.object({
    title: Joi.string().min(5).max(150).required(),
    slug: Joi.string().regex(/^[a-z0-9-]+$/).required(),

    descriptionMarkdown: Joi.string().required(),

    difficulty: Joi.string()
        .valid("EASY", "MEDIUM", "HARD")
        .required(),

    tags: Joi.array().items(Joi.string()).default([]),

    constraints: Joi.string().allow(""),

    ioFormat: Joi.object({
        input: Joi.string().required(),
        output: Joi.string().required()
    }).required(),

    publicTestCases: Joi.array()
        .items(
            Joi.object({
                input: Joi.string().required(),
                output: Joi.string().required()
            })
        )
        .min(1)
        .required(),

    hiddenTestCases: Joi.array()
        .items(
            Joi.object({
                input: Joi.string().required(),
                output: Joi.string().required()
            })
        )
        .min(1)
        .required(),

    timeLimit: Joi.number().min(500).max(5000).default(1000),
    memoryLimit: Joi.number().min(65536).default(262144)
});
