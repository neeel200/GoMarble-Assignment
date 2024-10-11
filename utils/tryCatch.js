
const customError = require("./customError.js");

// global try catch

const tryCatch = (controller) => async (req, res, next) => {
  try {
    return await controller(req, res, next);
  } catch (error) {
    console.error(`Error occurred in ${req.originalUrl}: ${error}`);
    res.write(`ERROR: ${error}\n`);
    res.end();
  }
};


module.exports = tryCatch;