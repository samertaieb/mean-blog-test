import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.js";
type Role = "admin" | "editor" | "writer" | "reader";

export const requireRole = (...roles: Role[]) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role as Role | undefined;
    if (!userRole) return res.status(401).json({ message: "Unauthorized" });
    if (!roles.includes(userRole)) return res.status(403).json({ message: "Forbidden" });
    next();
  };
