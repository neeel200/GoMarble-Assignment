
const customError = require("./customError.js");

// global try catch

const tryCatch = (controller) => async (req, res, next) => {
  try {
    return await controller(req, res, next);
  } catch (error) {
    console.error(`Error occurred in ${req.originalUrl}: ${error}`);
    const originalError = error instanceof customError ? error : new customError(error.message, 400);
    originalError.stack = error.stack;

    return next(originalError);
  }
};


module.exports = tryCatch;