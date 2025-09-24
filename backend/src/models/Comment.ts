import mongoose, { Schema, Document, Types } from "mongoose";

export interface IComment extends Document {
  
  article: Types.ObjectId;
  author: Types.ObjectId;
  content: string;
  parent?: Types.ObjectId;
}

const CommentSchema = new Schema<IComment>(
  {
    article: { type: Schema.Types.ObjectId, ref: "Article", required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    parent: { type: Schema.Types.ObjectId, ref: "Comment" },
  },
  { timestamps: true }
);

export const Comment = mongoose.model<IComment>("Comment", CommentSchema);
