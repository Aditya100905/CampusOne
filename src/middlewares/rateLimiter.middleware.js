import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many login attempts from this IP, please try again after 15 minutes.",
    code: 429
  },
  standardHeaders: true,
  legacyHeaders: false, 
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many login attempts from this IP, please try again after 15 minutes.",
      code: 429
    });
  }
});