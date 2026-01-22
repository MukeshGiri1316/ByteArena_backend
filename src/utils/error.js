export const sendError = (
    res,
    statusCode = 500,
    message = "Something went wrong",
    errors = null
) => {
    return res.status(statusCode).json({
        success: false,
        message,
        errors,
    });
};
