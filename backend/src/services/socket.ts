import { Server } from "socket.io";
import { Article } from "../models/Article.js";

let io: Server | null = null;

export const initSocket = (server: any, corsOrigin: string) => {
  io = new Server(server, { cors: { origin: corsOrigin } });
  io.on("connection", (socket) => {
    socket.on("join_user_room", (userId: string) => socket.join(`user:${userId}`));
  });
  return io;
};

export const notifyArticleAuthor = async (articleId: string, payload: any) => {
  if (!io) return;
  const article = await Article.findById(articleId).populate("author", "_id");
  const room = article?.author ? `user:${(article.author as any)._id}` : null;
  if (room) io.to(room).emit("notification", payload);
};
