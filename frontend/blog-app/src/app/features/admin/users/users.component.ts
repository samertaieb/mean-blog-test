import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/api.service';

@Component({
  standalone: true,
  selector: 'app-users',
  imports: [FormsModule, CommonModule],
  templateUrl: './users.component.html'
})
export class UsersComponent {
  api = inject(ApiService);
  users = signal<any[]>([]);
  roles = ['admin','editor','writer','reader'];
  rolesMap: Record<string,string> = {};

  constructor(){
    this.api.listUsers().subscribe((list:any[]) => {
      this.users.set(list);
      list.forEach(u => this.rolesMap[u._id] = u.role);
    });
  }

  change(u:any){
    const role = this.rolesMap[u._id];
    this.api.changeRole(u._id, role).subscribe();
  }
}
