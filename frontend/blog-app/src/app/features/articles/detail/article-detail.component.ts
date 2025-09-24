import { Component, inject, signal, computed, effect } from '@angular/core';
import { ActivatedRoute, RouterLink, ParamMap } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/api.service';
import { Article, CommentNode } from '../../../core/models';
import { AuthService } from '../../../core/auth.service';
import { CommentsThreadComponent } from '../../../shared/components/comments-thread.component';

@Component({
  standalone: true,
  selector: 'app-article-detail',
  imports: [RouterLink, FormsModule, CommonModule, CommentsThreadComponent],
  templateUrl: './article-detail.component.html'
})
export class ArticleDetailComponent {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
 auth = inject(AuthService);

  article = signal<Article | null>(null);
  comments = signal<CommentNode[]>([]);
  comment = '';

  private isObjectId = (v: string | null): v is string =>
    !!v && /^[a-f\d]{24}$/i.test(v);

  articleId = signal<string | null>(null);
  isValidId = computed(() => this.isObjectId(this.articleId()));

  constructor() {
    this.route.paramMap.subscribe((pm: ParamMap) => {
      const id = pm.get('id');
      this.articleId.set(id);

      if (this.isValidId()) {
        this.api.getArticle(id!).subscribe(a => this.article.set(a));
        this.refreshComments();
      } else {
        this.article.set(null);
        this.comments.set([]);
      }
    });
  }

  refreshComments() {
    const id = this.articleId();
    if (!this.isObjectId(id)) return; 
    this.api.getComments(id).subscribe(list => this.comments.set(list));
  }

  canEdit(a: Article) {
    const u = this.auth.user();
    if (!u) return false;
    return u.role === 'admin' || u.role === 'editor' || u.id === a.author?._id;
  }

  _addComment() {
    const id = this.articleId();
    const content = this.comment.trim();

    if (!content || !this.isObjectId(id)) return;

    this.api.addComment({ articleId: id, content }).subscribe(() => {
      this.comment = '';
      this.refreshComments();
    });
  }
}
