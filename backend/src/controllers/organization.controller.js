import { Organization } from "../models/organization.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { SUPPORTED_CURRENCIES } from "../constants.js";

const registerOrganization = asyncHandler(async (req, res) => {
  const {
    name,
    address,
    email,
    phone,
    taxNumber,
    invoicePrefix,
    currency,
    password,
  } = req.body;

  if (
    [name, address, email, phone, currency, password].some(
      (field) => !field || field?.trim() === ""
    )
  )
    throw new ApiError(400, "Missing required fields");

  if (!SUPPORTED_CURRENCIES.includes(currency.trim().toUpperCase()))
    throw new ApiError(400, "Invalid currency");

  const existingOrg = await Organization.findOne({ name });
  if (existingOrg) throw new ApiError(400, "Organization already exists");

  const payload = {
    name,
    address,
    email,
    phone,
    currency,
    password,
  };

  if (invoicePrefix && invoicePrefix.trim() !== "")
    payload.invoicePrefix = invoicePrefix.trim();
  if (taxNumber && taxNumber.trim() !== "")
    payload.taxNumber = taxNumber.trim();

  const org = await Organization.create(payload);

  const safeOrg = org.toObject();
  delete safeOrg.password;
  delete safeOrg.refreshToken;

  return res
    .status(201)
    .json(new ApiResponse(201, safeOrg, "Organization created successfully"));
});

const loginOrganization = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if ((!email || email.trim() === "") && (!name || name.trim() === "")) {
    throw new ApiError(400, "Either name or email is required");
  }

  if (!password || password.trim() === "")
    throw new ApiError(400, "Password is required");

  const existingOrg = await User.findOne({
    $or: [{ name }, { email }],
  });

  if (!existingOrg) throw new ApiError(400, "Invalid credentials");

  const isPasswordCorrect = await existingOrg.isPasswordCorrect(password);
  if (!isPasswordCorrect) throw new ApiError(400, "Invalid credentials");
});

const deleteOrganization = asyncHandler(async (req, res) => {
  // user details is injected by auth middleware
  if (req.user.role !== "admin")
    throw new ApiError(
      403,
      "Unauthorized request: only admins can delete organizations"
    );

  const { name, password } = req.body;

  const org = await Organization.findOne({ name });
  if (!org) throw new ApiError(400, "Invalid credentials");

  const isPasswordCorrect = await org.isPasswordCorrect(password);
  if (!isPasswordCorrect) throw new ApiError(400, "Invalid credentials");

  await Organization.findByIdAndDelete(org._id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Organization data deleted successfully"));
});

const updateOrganization = asyncHandler(async (req, res) => {
  // user details is injected by auth middleware
  if (req.user.role !== "admin")
    throw new ApiError(
      403,
      "Unauthorized request: only admins can delete organizations"
    );

  const {
    previousName,
    name,
    address,
    phone,
    email,
    taxNumber,
    invoicePrefix,
    currency,
  } = req.body;

  const org = Organization.findOne({
    previousName,
  });


});
