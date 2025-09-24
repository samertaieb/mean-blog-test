import { Router } from "express";
import { Types } from "mongoose";
import { Article } from "../models/Article";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/roles";
import type { AuthRequest } from "../middleware/auth";

const router = Router();

// helper(s)
const isOid = (v: any) => typeof v === "string" && /^[a-f\d]{24}$/i.test(v);
const validateObjectId = (param: string = "id") => (req: any, res: any, next: any) => {
  if (!isOid(req.params[param])) return res.status(400).json({ error: `Invalid ObjectId for '${param}'` });
  next();
};

router.post(
  "/",
  requireAuth,
  requireRole("writer", "editor", "admin"),
  async (req: AuthRequest, res, next) => {
    try {
      const { title, content, imageUrl, tags } = req.body;

      if (!title?.trim()) {
        return res.status(400).json({ error: "ValidationError", details: { title: "Title is required" } });
      }

      // detect your schema's text field (content/body/text/description)
      const textField = ["content", "body", "text", "description"].find(f => !!Article.schema.path(f));
      const authorField = ["author", "user", "owner", "createdBy"].find(f => !!Article.schema.path(f));

      const doc: any = { title: title.trim() };
      if (imageUrl !== undefined && Article.schema.path("imageUrl")) doc.imageUrl = imageUrl;
      if (Array.isArray(tags) && Article.schema.path("tags")) doc.tags = tags;

      if (textField && typeof content === "string") doc[textField] = content;
      if (authorField) doc[authorField] = req.user!.sub; // your JWT 'sub' should be the user _id string

      const article = await Article.create(doc);
      const populated = await article.populate("author", "username role");
      return res.status(201).json(populated);
    } catch (e: any) {
      // <-- this is key: you’ll see EXACTLY what failed in Network tab and server logs
      if (e?.name === "ValidationError") {
        return res.status(400).json({ error: "ValidationError", details: e.errors });
      }
      console.error("CREATE /articles failed:", e);
      return next(e);
    }
  }
);


router.get("/", async (req, res, next) => {
  try {
    const { tag, q } = req.query as any;
    const limit = Math.max(1, Math.min(100, Number((req.query as any).limit ?? 20)));
    const page  = Math.max(1, Number((req.query as any).page ?? 1));

    const filter: any = {};
    if (tag) filter.tags = tag; // exact element match in tags array

    const hasQ = typeof q === "string" && q.trim().length > 0;

    let query = Article.find(filter).populate("author", "username role");

    if (hasQ) {
      query = query
        .find({ $text: { $search: q.trim() } })
        .select({ score: { $meta: "textScore" } })
        .sort({ score: { $meta: "textScore" } });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    let items = await query.limit(limit).skip((page - 1) * limit);

    if (hasQ && items.length === 0) {
      const rx = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      const altFilter: any = { ...filter, $or: [{ title: rx }, { content: rx }] };
      items = await Article.find(altFilter)
        .populate("author", "username role")
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit);
    }

    res.json(items);
  } catch (e) {
    next(e);
  }
});


router.get("/:id", validateObjectId("id"), async (req, res, next) => {
  try {
    const a = await Article.findById(req.params.id).populate("author", "username role");
    if (!a) return res.status(404).json({ message: "Not found" });
    res.json(a);
  } catch (e) {
    next(e);
  }
});

router.patch(
  "/:id",
  requireAuth,
  requireRole("writer", "editor", "admin"),
  validateObjectId("id"),
  async (req: AuthRequest, res, next) => {
    try {
      const a = await Article.findById(req.params.id);
      if (!a) return res.status(404).json({ message: "Not found" });

      const canEditAny = ["editor", "admin"].includes(req.user!.role);
      const owns = String(a.author) === req.user!.sub;
      if (!canEditAny && !owns) return res.status(403).json({ message: "Forbidden" });

      const updates: any = {};
      for (const [k, v] of Object.entries(req.body)) {
        if (Article.schema.path(k) !== undefined) updates[k] = v;
      }
      Object.assign(a, updates);

      await a.save();
      const populated = await a.populate("author", "username role");
      res.json(populated);
    } catch (e: any) {
      if (e?.name === "ValidationError") {
        return res.status(400).json({ error: "ValidationError", details: e.errors });
      }
      next(e);
    }
  }
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  validateObjectId("id"),
  async (req, res, next) => {
    try {
      const deleted = await Article.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Not found" });
      res.json({ ok: true });
    } catch (e) {
      next(e);
    }
  }
);

export default router;
