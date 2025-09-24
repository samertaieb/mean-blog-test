import { HttpInterceptorFn, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, throwError, of, ReplaySubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

const REFRESH_IN_FLIGHT$ = new ReplaySubject<boolean>(1);
let isRefreshing = false;

const isApiUrl = (url: string) => {
  if (url.startsWith('http')) return url.startsWith(environment.apiUrl);
  return true; 
};

const withAuth = (req: HttpRequest<any>, token: string | null) =>
  token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const api = isApiUrl(req.url);

  const access = localStorage.getItem('access');
  const authedReq = api ? withAuth(req, access) : req;

  return next(authedReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (!api || err.status !== 401) {
        return throwError(() => err);
      }

      const alreadyRetried = req.headers.has('X-Retry');
      if (alreadyRetried) {
        auth.logout?.();
        return throwError(() => err);
      }

      if (!isRefreshing) {
        isRefreshing = true;
        return from(auth.tryRefresh()).pipe(
          switchMap((ok) => {
            isRefreshing = false;
            REFRESH_IN_FLIGHT$.next(ok);
            if (!ok) {
              auth.logout?.();
              return throwError(() => err);
            }
            const newAccess = localStorage.getItem('access');
            const retry = withAuth(req.clone({ headers: req.headers.set('X-Retry', '1') }), newAccess);
            return next(retry);
          }),
          catchError((e) => {
            isRefreshing = false;
            REFRESH_IN_FLIGHT$.next(false);
            auth.logout?.();
            return throwError(() => e);
          })
        );
      }

      return REFRESH_IN_FLIGHT$.pipe(
        filter((done) => done !== undefined),
        take(1),
        switchMap((ok) => {
          if (!ok) {
            auth.logout?.();
            return throwError(() => err);
          }
          const newAccess = localStorage.getItem('access');
          const retry = withAuth(req.clone({ headers: req.headers.set('X-Retry', '1') }), newAccess);
          return next(retry);
        })
      );
    })
  );
};
