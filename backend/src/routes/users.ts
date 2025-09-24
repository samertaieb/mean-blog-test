import { Router } from "express";
import { User } from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";

const router = Router();

router.get("/", requireAuth, requireRole("admin"), async (_req, res) => {
  const users = await User.find().select("username email role createdAt");
  res.json(users);
});

router.patch("/:id/role", requireAuth, requireRole("admin"), async (req, res) => {
  const { role } = req.body;
  if (!["admin","editor","writer","reader"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  res.json(user);
});

export default router;
