import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { Article, CommentNode, User } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  register(dto:{username:string; email:string; password:string; role?:string}){
    return this.http.post(`${this.api}/auth/register`, dto);
  }
  login(dto:{email:string; password:string}){
    return this.http.post<{access:string; refresh:string; user:User}>(`${this.api}/auth/login`, dto);
  }
  refresh(refresh:string){
    return this.http.post<{access:string}>(`${this.api}/auth/refresh`, { refresh });
  }

  listUsers(){ return this.http.get<any[]>(`${this.api}/users`); }
  changeRole(id:string, role:string){ return this.http.patch(`${this.api}/users/${id}/role`, { role }); }

  listArticles(opts:{q?:string; tag?:string; page?:number; limit?:number} = {}){
    let params = new HttpParams();
    Object.entries(opts).forEach(([k,v])=>{ if(v!==undefined && v!==null) params = params.set(k,String(v)); });
    return this.http.get<Article[]>(`${this.api}/articles`, { params });
  }
  getArticle(id:string){ return this.http.get<Article>(`${this.api}/articles/${id}`); }
  createArticle(dto: Partial<Article>){ return this.http.post<Article>(`${this.api}/articles`, dto); }
  updateArticle(id:string, dto: Partial<Article>){ return this.http.patch<Article>(`${this.api}/articles/${id}`, dto); }
  deleteArticle(id:string){ return this.http.delete(`${this.api}/articles/${id}`); }

  addComment(dto:{articleId:string; content:string; parentId?:string}){
    return this.http.post(`${this.api}/comments`, dto);
  }
  getComments(articleId:string){
    return this.http.get<CommentNode[]>(`${this.api}/comments/by-article/${articleId}`);
  }

refreshAlt(refreshToken: string) {
  return this.http.post<any>(`${this.api}/auth/refresh`, { refreshToken });
}

}
