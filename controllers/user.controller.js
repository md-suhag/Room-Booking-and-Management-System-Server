const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const validator = require("validator");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { generateToken } = require("../middlewares/auth");

const signupUser = catchAsync(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (!validator.isEmail(email)) {
    return next(new AppError("Please enter a valid email", 400));
  }

  // Normalize email
  const normalizedEmail = validator.normalizeEmail(email);
  const existUser = await User.findOne({ email: normalizedEmail });
  if (existUser) {
    return next(new AppError("User already exists!", 400));
  }

  // Validate password strength
  if (
    !validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
  ) {
    return next(
      new AppError(
        "Password must be stronger (at least 8 characters, include uppercase, lowercase, numbers, and special characters)",
        400
      )
    );
  }

  const saltRounds = await bcrypt.genSalt(
    Number(process.env.BCRYPT_SALT_ROUNDS) || 10
  );
  const hashPassword = await bcrypt.hash(password, saltRounds);

  const newUser = new User({
    name,
    email: normalizedEmail,
    password: hashPassword,
    role,
  });

  await newUser.save();
  const token = generateToken(newUser);

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
    maxAge: 3600000,
  });

  return res.status(201).json({
    success: true,
    token,
    message: "Registered successfully!",
  });
});

const loginUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email
  if (!validator.isEmail(email)) {
    return next(new AppError("Please enter a valid email", 400));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("Invalid email or password", 401));
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    return next(new AppError("Invalid email or password", 401));
  }

  const token = generateToken(user);

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
    maxAge: 3600000,
  });

  res.status(200).json({
    success: true,
    token,
    message: "Logged in successfully",
  });
});

module.exports = { signupUser, loginUser };
