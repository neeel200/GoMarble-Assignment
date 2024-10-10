const errController = async (error, req, res, next) => {

  // console.log("ERROR: ", error)

  return res.status(error.statusCode || 500).json({
    message: error.message,
    status: error.status,
    stack: error.stack,
  });

};

module.exports = errController;