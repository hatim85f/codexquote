const User = require("../models/Users");

// Create a middleware function to check if a user is authorized to check financial details
module.exports = async (req, res, next) => {
  const userId = req.header("user-id");

  if (!userId) {
    return res.status(401).json({
      message:
        "You are not authorized to perform this opertaion, login or contact your provider",
    });
  }

  const user = await User.findOne({ _id: userId });
  const isAdmin = user.isFinanceAdmin;

  if (isAdmin) {
    // If the user is authorized, continue to the next middleware/route handler
    next();
  } else {
    return res.status(403).json({
      error: "Unauthorized",
      message:
        "You are not authorized to perform this action. please contact your admin.",
    });
  }
};
