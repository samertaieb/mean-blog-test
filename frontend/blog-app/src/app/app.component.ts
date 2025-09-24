import { Component, inject } from '@angular/core';
import { RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterModule, CommonModule],
  templateUrl: './app.component.html'
})
export class AppComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  logout() { this.auth.logout(); }

  resetFilters(ev?: Event) {
    ev?.preventDefault();
    this.router.navigate(['/'], { queryParams: {}, replaceUrl: true });
  }
}
