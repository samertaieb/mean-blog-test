import { Injectable, WritableSignal, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { User } from './models';

type LoginResponse = { access: string; refresh: string; user: User };
type RefreshResponse = { access?: string; accessToken?: string; token?: string };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user: WritableSignal<User | null> = signal(this.restoreUser());
  user = computed(() => this._user());

  isRole = (role: string) => this._user()?.role === role || false;
  hasAnyRole = (roles: string[]) => !!this._user() && roles.includes(this._user()!.role);

  constructor(private api: ApiService, private router: Router) {}

  private restoreUser(): User | null {
    const raw = localStorage.getItem('user');
    try { return raw ? (JSON.parse(raw) as User) : null; }
    catch { return null; }
  }

  setSession(access: string, refresh: string, user: User) {
    localStorage.setItem('access', access);
    localStorage.setItem('refresh', refresh);
    localStorage.setItem('user', JSON.stringify(user));
    this._user.set(user);
  }

  clearSession() {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    this._user.set(null);
  }

  async login(email: string, password: string) {
    const res = await firstValueFrom(this.api.login({ email, password })) as LoginResponse;
    this.setSession(res.access, res.refresh, res.user);
    return res;
  }

  logout() {
    this.clearSession();
    this.router.navigateByUrl('/login');
  }


  async tryRefresh(): Promise<boolean> {
    const stored = localStorage.getItem('refresh');
    if (!stored) return false;

    try {
      let res = await firstValueFrom(this.api.refresh(stored)) as RefreshResponse;

      let newAccess = res.access ?? res.accessToken ?? res.token ?? null;

      if (!newAccess) {
        const alt = await firstValueFrom(this.api.refreshAlt(stored)) as RefreshResponse;
        newAccess = alt.access ?? alt.accessToken ?? alt.token ?? null;
      }

      if (!newAccess) throw new Error('No access token in refresh response');

      localStorage.setItem('access', newAccess);
      return true;
    } catch {
      this.clearSession();
      return false;
    }
  }
}
