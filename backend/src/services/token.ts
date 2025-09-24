import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

export interface JwtPayload { sub: string; role: string; }

export const signAccessToken  = (p: JwtPayload) => jwt.sign(p, config.jwt.accessSecret,  { expiresIn: config.jwt.accessTtl });
export const signRefreshToken = (p: JwtPayload) => jwt.sign(p, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshTtl });
export const verifyAccessToken  = (t: string) => jwt.verify(t, config.jwt.accessSecret)  as JwtPayload;
export const verifyRefreshToken = (t: string) => jwt.verify(t, config.jwt.refreshSecret) as JwtPayload;
