import { Router } from "express";
import bcrypt from "bcrypt";
import { User } from "../models/User.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../services/token.js";

const router = Router();

router.post("/register", async (req, res) => {
  const { username, email, password, role } = req.body;
  const exists = await User.findOne({ $or: [{ email }, { username }] });
  if (exists) return res.status(409).json({ message: "User exists" });
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ username, email, password: hash, role: role || "reader" });
  res.status(201).json({ id: user._id, username: user.username, email: user.email, role: user.role });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const payload = { sub: String(user._id), role: user.role };
  res.json({
    access: signAccessToken(payload),
    refresh: signRefreshToken(payload),
    user: { id: user._id, username: user.username, role: user.role }
  });
});

router.post("/refresh", (req, res) => {
  const { refresh } = req.body;
  if (!refresh) return res.status(400).json({ message: "Missing refresh token" });
  try {
    const p = verifyRefreshToken(refresh);
    return res.json({ access: signAccessToken({ sub: p.sub, role: p.role }) });
  } catch {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
});

export default router;
