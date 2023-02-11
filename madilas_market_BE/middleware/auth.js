import jwt from "jsonwebtoken";

const auth = async (req, res, next) => {
  let token;

  if (
    //In http headers, we have authorisations object
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      //Get token from bearer. split turns it into an array and gets value of position [1] which is token. value of [0] = bearer tag
      token = await req.headers.authorization.split(" ")[1];
      if (!token) {
        res.status(401).json({ message: "❌ Not authorized, no token" });
      }

      // If token is less than 500 it is ours else user token is from google auth
      const isCustomAuth = token.length < 500;

      let decodedData;

      // Verify token
      if (token && isCustomAuth) {
        decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);

        // Get user from the token
        req.userId = decodedData?.id;
        // req.user = (decodedData?.id).select("-password");
      }

      next();
    } catch (error) {
      console.log(error.message);
      res.status(401).json({ message: "❌ Not authorized" });
    }
  }
};


export default auth;
