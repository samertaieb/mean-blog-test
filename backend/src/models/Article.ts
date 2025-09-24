import mongoose, { Schema, Document, Types } from "mongoose";

export interface IArticle extends Document {
  title: string;
  content: string;
  imageUrl?: string;
  tags: string[];
  author: Types.ObjectId;
  views: number;
  likes: number;
}

const ArticleSchema = new Schema<IArticle>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    imageUrl: { type: String },
    tags: [{ type: String }],
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ArticleSchema.index({ title: "text", content: "text", tags: "text" });

export const Article = mongoose.model<IArticle>("Article", ArticleSchema);
