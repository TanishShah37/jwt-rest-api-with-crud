const config = require("../config/config");
const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const token = req.header("token");
  if (!token)
    return res.status(401).json({ msg: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.agency = decoded;
    next();
  } catch (e) {
    res.status(400).json({ msg: "Token is not valid" });
  }
};

module.exports = auth;