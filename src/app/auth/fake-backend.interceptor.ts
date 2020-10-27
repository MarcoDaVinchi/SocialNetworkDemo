import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { ok } from 'assert';
import { mergeMap } from 'rxjs/operators';

const users = [
  {
    id: 1,
    username: 'admin',
    password: 'admin',
    firstName: 'Admin',
    lastName: 'Adminovich',
  },
];
@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const { url, method, headers, body } = request;

    return of(null).pipe(mergeMap(handleRoute));

    function handleRoute() {
      switch (true) {
        case url.endsWith('/users/authenticate') && method === 'POST':
          return authenticate();
        case url.endsWith('/users') && method === 'GET':
          return getUsers();
        default:
          return next.handle(request);
      }
    }

    function authenticate() {
      const { username, password } = body;
      const user = users.find(
        (u) => u.username === username && u.password === password
      );
      if (!user) return error('Username or password is incorrect');
      return ok({
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        token: 'fake-jwt-token',
      });
    }

    function getUsers() {
      if (!isLoggedIn()) {
        return unauthorized();
      }
      return ok(users);
    }

    function ok(reqBody?) {
      return of(new HttpResponse({ status: 200, body: reqBody }));
    }

    function error(message) {
      return throwError({ error: { message } });
    }

    function unauthorized() {
      return throwError({ status: 401, error: { message: 'Unauthorized' } });
    }

    function isLoggedIn() {
      return headers.get('Authorization') === 'Bearer fake-jwt-token';
    }
  }
}

export let fakeBackendProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: FakeBackendInterceptor,
  multi: true,
};
