import { check, validationResult } from "express-validator";

export const validateUser = [
  check("email").normalizeEmail().isEmail().withMessage("Email is not valid"),
  check("password")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Password is missing")
    .isLength({ min: 8, max: 20 })
    .withMessage("Password must be at least 8 to 20 characters longs!")
    .isAlphanumeric()
    .withMessage("Password must contain both letter and number"),
  check("first_name")
    .trim()
    .not()
    .isEmpty()
    .withMessage("first_name is missing"),
  check("last_name").trim().not().isEmpty().withMessage("last_name is missing"),
  // check("phone")
  //   .trim()
  //   .not()
  //   .isEmpty()
  //   .withMessage("phone number is missing")
  //   .isMobilePhone({
  //     options: ['en-NG'],
  //     errorMessage: "Must provide a vaild NG phone number"
  //   })
  //   .withMessage("Must provide a valid phone number")
];

export const validateStoreInfo = [
  check("store_name")
    .trim()
    .not()
    .isEmpty()
    .withMessage("store_name is missing")
    .isLength({ max: 50 })
    .withMessage("store_name must be at least 50 characters longs!"),
  check("store_description")
    .trim()
    .not()
    .isEmpty()
    .withMessage("store_description is missing")
    .isLength({ max: 2000 })
    .withMessage("store_description must be at least 2000 characters longs!"),
  check("store_location")
    .trim()
    .not()
    .isEmpty()
    .withMessage("store_location is missing")
    .isLength({ max: 500 })
    .withMessage("store_location must be at least 500 characters longs!"),
  check("store_owner_address")
    .trim()
    .not()
    .isEmpty()
    .withMessage("store_owner_address is missing"),
  check("isInMandilasMarket")
    .trim()
    .not()
    .isEmpty()
    .withMessage("isInMandilasMarket is missing")
    .isBoolean()
    .withMessage("isInMandilasMarket should be true or false"),
];

export const validate = (req, res, next) => {
  const error = validationResult(req).array();
  if (!error.length) return next();

  res.status(400).json({ success: false, error: error[0].msg });
};
