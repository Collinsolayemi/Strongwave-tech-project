import crypto from "crypto";

//Accepting error response and status code and sending a respone back to the user
export const sendError = async (res, error, status = 401) => {
  res.status(status).json({ success: false, error: error });
};

export const randomBytes = () =>
  new Promise((resolve, reject) => {
    crypto.randomBytes(25, (err, buff) => {
      if (err) reject(err);

      const token = buff.toString("hex");
      resolve(token);
    });
  });
