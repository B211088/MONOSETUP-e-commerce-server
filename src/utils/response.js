export const successResponse = (
  res,
  data = null,
  message = "success",
  statusCode = 200
) => {
  return res
    .status(statusCode)
    .json({ success: true, message, data, error: null });
};

export const errorResponse = (res, message = "Error", statusCode = 500) => {
  return res.status(statusCode).json({ success: false, message });
};
