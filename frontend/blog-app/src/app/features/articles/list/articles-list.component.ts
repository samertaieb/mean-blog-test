import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/api.service';
import { Article } from '../../../core/models';

@Component({
  standalone: true,
  selector: 'app-articles-list',
  imports: [RouterLink, FormsModule, CommonModule, RouterModule],
  templateUrl: './articles-list.component.html'
})
export class ArticlesListComponent {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  items = signal<Article[]>([]);
  q = '';
  tag = '';

  constructor() {
    this.route.queryParamMap.subscribe(pm => {
      this.q = (pm.get('q') || '').trim();
      this.tag = (pm.get('tag') || '').trim();
      this.load(); 
    });
  }

  private load() {
    const opts: any = {};
    if (this.q)   opts.q = this.q;
    if (this.tag) opts.tag = this.tag;

    const src$ = (Object.keys(opts).length === 0)
      ? this.api.listArticles()
      : this.api.listArticles(opts);

    src$.subscribe(res => this.items.set(res));
  }

  applyFilters() {
    const qp: any = {};
    if (this.q.trim())   qp.q = this.q.trim();
    if (this.tag.trim()) qp.tag = this.tag.trim();

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: qp,
      queryParamsHandling: '', 
      replaceUrl: true
    });
  }

  reset() {
    this.q = '';
    this.tag = '';
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      queryParamsHandling: '',
      replaceUrl: true
    });
  }
}
