const RABBITMQ_API_KEY = process.env.RABBITMQ_API_KEY;

export const apiKeyMiddleware = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    return res.status(401).json({ success: false, message: "API Key missing" });
  }

  if (apiKey !== RABBITMQ_API_KEY) {
    return res.status(403).json({ success: false, message: "Invalid API Key" });
  }

  next();
};
