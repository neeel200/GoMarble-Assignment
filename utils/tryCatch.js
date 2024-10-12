
const customError = require("./customError.js");

// global try catch

const tryCatch = (controller) => async (req, res, next) => {
  try {
    return await controller(req, res, next);
  } catch (error) {
    console.error(`Error occurred in ${req.originalUrl}: ${error}`);
    if (res.writable) {
      res.write(`ERROR: ${JSON.stringify(error.message)}\n`);
      res.end();
  } else {
      console.log('Response is no longer writable.');
  }
    
  }
};


module.exports = tryCatch;