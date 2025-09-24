import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/api.service';
import { Article } from '../../../core/models';
import { AuthService } from '../../../core/auth.service';

@Component({
  standalone: true,
  selector: 'app-article-edit',
  imports: [FormsModule, CommonModule],
  templateUrl: './article-edit.component.html'
})
export class ArticleEditComponent {
  route = inject(ActivatedRoute);
  router = inject(Router);
  api = inject(ApiService);
  auth = inject(AuthService);   

  isNew = true;
  loaded = false;
  id: string | null = null;
  title = '';
  imageUrl = '';
  tags = '';
  content = '';

  constructor() {
    this.id = this.route.snapshot.paramMap.get('id');
    this.isNew = this.id === 'new' || this.id === null;
    if (!this.isNew && this.id) {
      this.api.getArticle(this.id).subscribe(a => {
        this.title = a.title;
        this.imageUrl = a.imageUrl || '';
        this.tags = a.tags?.join(',') || '';
        this.content = a.content;
        this.loaded = true;
      });
    } else {
      this.loaded = true;
    }
  }

  save() {
    const dto: Partial<Article> = {
      title: this.title,
      imageUrl: this.imageUrl,
      content: this.content,
      tags: this.tags.split(',').map(t => t.trim()).filter(Boolean)
    };
    if (this.isNew) {
      this.api.createArticle(dto).subscribe(a =>
        this.router.navigate(['/articles', a._id])
      );
    } else if (this.id) {
      this.api.updateArticle(this.id, dto).subscribe(a =>
        this.router.navigate(['/articles', a._id])
      );
    }
  }

  del() {
    if (!this.id) return;
    if (!confirm('Supprimer cet article ?')) return;
    this.api.deleteArticle(this.id).subscribe(_ =>
      this.router.navigateByUrl('/')
    );
  }

  canDelete() {
    const u = this.auth.user();
    return u?.role === 'admin';
  }
}
