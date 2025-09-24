import { Types } from "mongoose";
import { RequestHandler } from "express";

export function validateObjectId(param: string = "id"): RequestHandler {
  return (req, res, next) => {
    const val = req.params[param];
    if (!Types.ObjectId.isValid(val)) {
      return res.status(400).json({ error: `Invalid ObjectId for '${param}'` });
    }
    next();
  };
}
