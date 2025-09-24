import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommentNode } from '../../core/models';

@Component({
  standalone: true,
  selector: 'app-comments-thread',
  imports: [CommonModule],
  templateUrl: './comments-thread.component.html',
  styles: [`
    .thread{display:flex;flex-direction:column;gap:12px}
    .replies{border-left:2px solid #22304a;margin-left:16px;padding-left:12px;display:flex;flex-direction:column;gap:12px}
  `]
})
export class CommentsThreadComponent {
  @Input() nodes: CommentNode[] = [];
}
