import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../services/token.js";

export interface AuthRequest extends Request {
  user?: { sub: string; role: string };
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ message: "Authorization header missing" });
  }
  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Invalid authorization format, expected 'Bearer <token>'" });
  }

  const token = header.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token missing after 'Bearer'" });
  }

  try {
    const payload = verifyAccessToken(token);
    if (!payload?.sub || !payload?.role) {
      return res.status(401).json({ message: "Invalid token payload" });
    }
    req.user = { sub: payload.sub, role: payload.role };
    next();
  } catch (err) {
    console.error(" Token verification failed:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
