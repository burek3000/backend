const jwt = require("jsonwebtoken");


module.exports = (req, res, next) => {
  console.log("Authorization middleware");

  const token = req.headers['authorization'];
  
  if (!token) {
    return res.status(401).send({ message: "Acess denied!" })
  }
  else {
    //validation
    try {
      const payload = jwt.verify(token, process.env.JWT_KEY);
      req.userData = payload;
      next();
    } catch (err) {
      console.log("JWT error: " + err)
      return res.status(401).json({
        message: 'Authentication failed - token issue',
      });
    }
  }
}