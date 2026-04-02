import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const generateAccessAndRefreshToken = async (user) => {
  try {
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save();
    return { accessToken, refreshToken };
  } catch (error) {
    // console.log(error)
    throw new ApiError(500, "Failed to generate access and refresh token");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, role, password } = req.body;
  if (
    [username, email, role, password].some(
      (field) => !field || field?.trim() === ""
    )
  )
    throw new ApiError(400, "All fields are required");

  if (!["admin", "stuff"].includes(role?.trim().toLowerCase()))
    throw new ApiError(400, "Role must be either admin or stuff");

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser)
    throw new ApiError(409, "User with email or username already exists");

  const user = await User.create({
    username,
    email,
    role,
    password,
  });

  const safeUser = user.toObject();
  delete safeUser.password;
  delete safeUser.refreshToken;

  if (!safeUser)
    throw new ApiError(500, "Failed to register user. Please try again");

  return res
    .status(201)
    .json(new ApiResponse(201, safeUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (
    (!email || email.trim() === "") &&
    (!username || username.trim() === "")
  ) {
    throw new ApiError(400, "Either username or email is required");
  }

  if (!password || password.trim() === "")
    throw new ApiError(400, "Password is required");

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!existingUser) throw new ApiError(400, "Invalid credentials");

  const isPasswordCorrect = await existingUser.isPasswordCorrect(password);
  if (!isPasswordCorrect) throw new ApiError(400, "Invalid credentials");

  const { accessToken, refreshToken } =
    await generateAccessAndRefreshToken(existingUser);

  const resUserObj = existingUser.toObject();
  delete resUserObj.password;
  delete resUserObj.refreshToken;

  return res
    .status(200)
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    })
    .json(
      new ApiResponse(
        200,
        {
          user: resUserObj,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // user data will be injected in req by auth middleware
  await User.findByIdAndUpdate(req.user._id, {
    $set: {
      refreshToken: null,
    },
  });

  return res
    .status(200)
    .clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    })
    .clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    })
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  // user data will be injected in req by auth middleware
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { currentUser: req.user },
        "Fetched user details successfully"
      )
    );
});

const changePassword = asyncHandler(async (req, res) => {
  // user data will be injected in req by auth middleware
  const { oldPassword, newPassword, confirmNewPassword } = req.body;

  if (
    !oldPassword ||
    oldPassword.trim() === "" ||
    !newPassword ||
    newPassword.trim() === "" ||
    !confirmNewPassword ||
    confirmNewPassword.trim() === ""
  )
    throw new ApiError(400, "All fields are required");

  if (newPassword.trim() !== confirmNewPassword.trim())
    throw new ApiError(
      400,
      "Make sure new password and confirm new password are same"
    );

  const user = await User.findById(req.user._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) throw new ApiError(400, "Invalid credentials");

  user.password = newPassword;
  await user.save({ validateBeforeSave: true });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password updated successfully"));
});

const deleteUser = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin")
    throw new ApiError(403, "Only admins can delete user accounts");

  const { username, password } = req.body;

  if (
    !username ||
    username.trim() === "" ||
    !password ||
    password.trim() === ""
  )
    throw new ApiError(400, "All fields are required");

  const user = await User.findOne({ username });
  if (!user) throw new ApiError(404, "User not found");
  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) throw new ApiError(400, "Invalid credentials");

  await user.deleteOne();

  res
    .status(200)
    .clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    })
    .clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    })
    .json(new ApiResponse(200, {}, "User deleted successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  generateAccessAndRefreshToken,
  getCurrentUser,
  changePassword,
  deleteUser,
};
