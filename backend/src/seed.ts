import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { config } from "./config/env";
import { User } from "./models/User";
import { Article } from "./models/Article";
import { Comment } from "./models/Comment";

function pickPath(model: mongoose.Model<any>, candidates: string[]) {
  for (const c of candidates) {
    if (model.schema.path(c)) return c;
  }
  return null;
}

function buildDoc(model: mongoose.Model<any>, candidateFields: Record<string, any>) {
  const doc: Record<string, any> = {};
  for (const [k, v] of Object.entries(candidateFields)) {
    if (v === undefined) continue;
    if (model.schema.path(k)) doc[k] = v;
  }
  return doc;
}

async function run() {
  await mongoose.connect(config.mongoUri);
  console.log("connected to MongoDB (seed)");

  const users = [
    { username: "admin",  email: "admin@mail.com",  password: "pass", role: "admin"  },
    { username: "editor", email: "editor@mail.com", password: "pass", role: "editor" },
    { username: "writer", email: "writer@mail.com", password: "pass", role: "writer" }
  ];

  const created: Record<string, any> = {};
  for (const u of users) {
    let user = await User.findOne({ email: u.email });
    if (!user) {
      const hashed = await bcrypt.hash(u.password, 10);
      const toCreate = buildDoc(User, {
        username: u.username,
        email: u.email,
        password: hashed,
        role: u.role,
      });
      user = await User.create(toCreate);
      console.log("Created user:", u.email);
    } else {
      console.log("Skip user (exists):", u.email);
    }
    created[u.role] = user;
  }

  const admin = created["admin"];

  const articleContentField = pickPath(Article, ["content", "body", "text", "description"]);
  const articleAuthorField = pickPath(Article, ["author", "user", "owner", "createdBy"]);
  const articleStatusField = pickPath(Article, ["status", "state", "published"]);

  // first article
  {
    const title = "Welcome to the Blog";
    const contentText = "First post seeded.";
    const filter: any = { title };
    const update: any = { title };

    if (articleContentField) update[articleContentField] = contentText;
    if (articleAuthorField && admin) update[articleAuthorField] = admin._id;
    if (articleStatusField) {
      const path = Article.schema.path(articleStatusField) as any;
      const enumVals: string[] | undefined = path?.options?.enum;
      update[articleStatusField] = enumVals?.includes("published") ? "published"
                             : enumVals?.[0] ?? true;
    }

    const doc = buildDoc(Article, update);
    const a1 = await Article.findOneAndUpdate(filter, doc, { upsert: true, new: true, runValidators: true });
    console.log("Upserted article:", a1?.get?.("title") ?? title);
  }

  // Second article 
  {
    const title = "Draft Example";
    const contentText = "This is a draft article.";
    const filter: any = { title };
    const update: any = { title };

    if (articleContentField) update[articleContentField] = contentText;
    if (articleAuthorField && admin) update[articleAuthorField] = admin._id;
    if (articleStatusField) {
      const path = Article.schema.path(articleStatusField) as any;
      const enumVals: string[] | undefined = path?.options?.enum;
      update[articleStatusField] = enumVals?.includes("draft") ? "draft"
                             : enumVals?.[0] ?? false;
    }

    const doc = buildDoc(Article, update);
    const a2 = await Article.findOneAndUpdate(filter, doc, { upsert: true, new: true, runValidators: true });
    console.log("Upserted article:", a2?.get?.("title") ?? title);
  }

  // ---------- Comment (adaptive) ----------
  const writer = created["writer"];
  const textField = pickPath(Comment, ["body", "content", "text", "message"]);
  const articleRefField = pickPath(Comment, ["article", "post", "articleId", "postId"]);
  const authorRefField = pickPath(Comment, ["author", "user", "owner", "createdBy"]);

  const anyArticle = await Article.findOne({});
  if (textField && anyArticle && writer) {
    const filter: any = {};
    const update: any = {};
    filter[textField] = "Great first post!";
    update[textField] = "Great first post!";
    if (articleRefField) { filter[articleRefField] = anyArticle._id; update[articleRefField] = anyArticle._id; }
    if (authorRefField)  { filter[authorRefField]  = writer._id;     update[authorRefField]  = writer._id; }

    const doc = buildDoc(Comment, update);
    if (Object.keys(doc).length > 0) {
      await Comment.findOneAndUpdate(filter, doc, { upsert: true, new: true, runValidators: true });
      console.log("Upserted comment on:", anyArticle.get?.("title") ?? anyArticle._id.toString());
    } else {
      console.log("Skip comment: your Comment schema doesn’t match expected fields.");
    }
  } else {
    console.log("Skip comment: missing text field or article/author ref in your schema.");
  }

  await mongoose.disconnect();
  console.log("seed done.");
}

run().catch((e) => {
  console.error("seed failed:", e);
  process.exit(1);
});
