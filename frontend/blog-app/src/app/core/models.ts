export type Role='admin'|'editor'|'writer'|'reader';
export interface User{ id:string; username:string; role:Role; }
export interface Article{ _id:string; title:string; content:string; imageUrl?:string; tags:string[]; author:{ _id:string; username:string; role:Role }; createdAt:string; updatedAt:string; views:number; likes:number; }
export interface CommentNode{ _id:string; content:string; author:{ _id:string; username:string; role:Role }; createdAt:string; replies:CommentNode[]; }
