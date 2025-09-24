import { Router } from "express";
import { Types } from "mongoose";
import { requireAuth } from "../middleware/auth";
import { Comment } from "../models/Comment";
import type { AuthRequest } from "../middleware/auth";
import { notifyArticleAuthor } from "../services/socket";

const router = Router();

// helper
const isOid = (v: any) => typeof v === "string" && Types.ObjectId.isValid(v);

// Create a comment
router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const { articleId, content, parentId } = req.body;

  // validate articleId and parentId before  using them
  if (!isOid(articleId)) {
    return res.status(400).json({ error: "Invalid articleId" });
  }
  if (parentId && !isOid(parentId)) {
    return res.status(400).json({ error: "Invalid parentId" });
  }

  const c = await Comment.create({
    article: articleId,
    author: req.user!.sub,
    content,
    parent: parentId,
  });

  await c.populate("author", "username role");
  notifyArticleAuthor(articleId, {
    type: "new_comment",
    commentId: String(c._id),
    articleId,
  });

  res.status(201).json(c);
});

// list comments for an article
router.get("/by-article/:articleId", async (req, res) => {
  const { articleId } = req.params;

  // validate articleId before querying
  if (!isOid(articleId)) {
    return res.status(400).json({ error: "Invalid articleId" });
  }

  const list = await Comment.find({ article: articleId })
    .populate("author", "username role")
    .sort({ createdAt: 1 });

  const map = new Map<string, any>();
  const roots: any[] = [];

  list.forEach((c) =>
    map.set(String(c._id), { ...c.toObject(), replies: [] as any[] })
  );

  list.forEach((c) => {
    const node = map.get(String(c._id));
    if (c.parent) {
      (map.get(String(c.parent))?.replies || roots).push(node);
    } else {
      roots.push(node);
    }
  });

  res.json(roots);
});

export default router;
