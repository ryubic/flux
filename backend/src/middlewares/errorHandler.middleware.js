export function errorHandler() {
  return (err, req, res, next) => {
    const status = res.statusCode || 500;

    // Generate an ID to trace logs without exposing details to client
    const time = Date.now();
    const errorId =
      time.toString() + "_" + Math.random().toString(36).substring(2);

    // Log full details for debugging
    console.error("ERROR LOG:", {
      time,
      errorId,
      message: err.message,
      stack: err.stack,
      path: req.originalUrl,
      method: req.method,
      body: req.body,
      params: req.params,
      query: req.query,
    });

    // Safe response for frontend
    const safeResponse = {
      success: false,
      message: status < 500 ? err.message : "Internal server error",
      time,
      errorId,
    };

    return res.status(status).json(safeResponse);
  };
}
