const errController = async (error, req, res, next) => {

  // console.log("ERROR: ", error)
  
  if(!res.writable) {
    return res.status(error.statusCode || 500).json({
      message: error.message,
      status: error.status,
      stack: error.stack,
    });

  }
//  res.write(`ERROR occured : ${error}`)
//  res.end()
};

module.exports = errController;
