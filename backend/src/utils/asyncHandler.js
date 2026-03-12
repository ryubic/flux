import { ApiError } from "./ApiError";

export const asyncHandler = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      throw new ApiError(error.code || error.message);
    }
  };
};
