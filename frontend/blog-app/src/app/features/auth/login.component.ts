import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [FormsModule,CommonModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  auth = inject(AuthService);
  router = inject(Router);
  email = ''; password = ''; error: string | null = null;

  async submit(){
    try {
      const res = await this.auth.login(this.email, this.password);
      if (res?.user) this.router.navigateByUrl('/');
    } catch {
      this.error = 'Échec de connexion';
      setTimeout(()=> this.error=null, 3000);
    }
  }
}
