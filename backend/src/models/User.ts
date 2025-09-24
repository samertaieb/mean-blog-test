import mongoose, { Schema, Document } from "mongoose";
export type Role = "admin" | "editor" | "writer" | "reader";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: Role;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin","editor","writer","reader"], default: "reader" },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);
