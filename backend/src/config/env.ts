import "dotenv/config";

export const config = {
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/mean_blog",
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || "change_me_access",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "change_me_refresh",
    accessTtl: process.env.ACCESS_TOKEN_TTL || "15m",
    refreshTtl: process.env.REFRESH_TOKEN_TTL || "30d",
  },
  corsOrigin: process.env.CORS_ORIGIN || "*",
};
