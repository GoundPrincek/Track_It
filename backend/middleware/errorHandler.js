const createHttpError = (statusCode, message, options = {}) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  error.code = options.code;
  return error;
};

const redactSensitivePath = (value = "") =>
  String(value).replace(/(\/reset-password\/)[^/?]+/gi, "$1[redacted]");

const notFoundHandler = (req, res, next) => {
  next(createHttpError(404, "Route not found"));
};

const errorHandler = (error, req, res, next) => {
  if (res.headersSent) return next(error);

  const statusCode = Number(error.statusCode || error.status);
  const validStatus = statusCode >= 400 && statusCode <= 599;
  const status = validStatus ? statusCode : 500;
  const isSafeClientError = error.isOperational === true && status < 500;
  let message = isSafeClientError ? error.message : "Something went wrong";

  if (error.type === "entity.parse.failed") {
    message = "Invalid JSON request body";
  } else if (error.type === "entity.too.large") {
    message = "Request body is too large";
  } else if (error.code === "LIMIT_FILE_SIZE") {
    message = "File is too large. Please upload a smaller file.";
  } else if (error.code === "LIMIT_FILE_COUNT") {
    message = "Please upload only one file at a time.";
  } else if (error.name === "MulterError") {
    message = "Unable to process the uploaded file.";
  }

  if (status >= 500) {
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        requestId: req.requestId,
        method: req.method,
        path: redactSensitivePath(req.path),
        status,
        errorName: error.name || "Error",
        errorCode: error.code || undefined,
      })
    );
  }

  const response = { success: false, message };
  if (error.validationErrors && status === 400) {
    response.message = "Validation failed";
    response.errors = error.validationErrors;
  }
  if (req.requestId) response.requestId = req.requestId;

  return res.status(status).json(response);
};

module.exports = { createHttpError, errorHandler, notFoundHandler };
