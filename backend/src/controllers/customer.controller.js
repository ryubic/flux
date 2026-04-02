import { Customer } from "../models/customer.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createCustomer = asyncHandler(async (req, res) => {
  const { name, phone, email, address, taxNumber } = req.body;

  if (!name || name.trim() === "" || !phone || phone.trim() === "")
    throw new ApiError(400, "Name and phone number are required");

  const customer = {
    name,
    phone,
  };
  if (email?.trim()) customer.email = email
  if (address?.trim()) customer.email = email
  if (taxNumber?.trim()) customer.email = email

  const newCustomer = await Customer.create(customer)
});
