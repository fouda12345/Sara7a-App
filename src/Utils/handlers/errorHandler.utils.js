const errorHandler = (err, req, res, next) => {
    let statusCode = Number(err.cause) || 500;
    if (err.message === "jwt expired") {err.message = "Invalid credentials, please login again"; statusCode = 401;}
    return res.status(statusCode).json({
        success: false,
        status: statusCode,
        message: err.message || "Internal server error",
        stack: err.stack,
        details: err.details
    });
};

export default errorHandler;