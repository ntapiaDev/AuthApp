import { Injectable } from '@angular/core';
import { User } from './user';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import jwtDecode from 'jwt-decode';
import { CookieService } from 'ngx-cookie-service';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  endpoint: string = 'http://localhost:4000/api';
  headers = new HttpHeaders().set('Content-Type', 'application/json');
  currentUser = {};
  constructor(private http: HttpClient, public router: Router, private cookieService: CookieService) {}
  // Sign-up
  signUp(user: User): Observable<any> {
    let api = `${this.endpoint}/register-user`;
    return this.http.post(api, user).pipe(catchError(this.handleError));
  }
  // Sign-in
  signIn(user: User) {
    return this.http
      .post<any>(`${this.endpoint}/signin`, user)
      .subscribe((res: any) => {
        // localStorage.setItem('access_token', res.token);

        // const cookieName = 'access_token';
        // const cookieValue = res.token;
        // const expirationDate = new Date();
        // expirationDate.setTime(expirationDate.getTime() + res.expiresIn);    
        // Créer un cookie sécurisé avec l'attribut HttpOnly et Secure
        // document.cookie = `${cookieName}=${cookieValue}; expires=${expirationDate.toUTCString()}; path=/; HttpOnly; Secure`;

        this.cookieService.set('access_token', res.token);

        this.getUserProfile(res._id).subscribe((res) => {
          this.currentUser = res;
          this.router.navigate(['user-profile/' + res.data._id]);
        });
      });
  }
  getToken() {
    // return localStorage.getItem('access_token');
    return this.cookieService.get('access_token');
  }
  getCurrentId() {
    // let authToken = localStorage.getItem('access_token');
    let authToken = this.cookieService.get('access_token');
    if (authToken) {
      const decodedToken: any = jwtDecode(authToken);
      return decodedToken.userId;
    } else return null;
  }
  get isLoggedIn(): boolean {
    // let authToken = localStorage.getItem('access_token');
    let authToken = this.cookieService.get('access_token');
    if (authToken) {
      const decodedToken: any = jwtDecode(authToken);   
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp && decodedToken.exp > currentTime) {
        return true;
      }
    }
    return false;
  }
  doLogout() {
    // let removeToken = localStorage.removeItem('access_token');
    let removeToken = this.cookieService.delete('access_token', '/');
    if (removeToken == null) {
      this.router.navigate(['log-in']);
    }
  }
  // User profile
  getUserProfile(id: any): Observable<any> {
    let api = `${this.endpoint}/user-profile/${id}`;
    return this.http.get(api, { headers: this.headers }).pipe(
      map((res) => {
        return res || {};
      }),
      catchError(this.handleError)
    );
  }
  // Error
  handleError(error: HttpErrorResponse) {
    let msg = '';
    if (error.error instanceof ErrorEvent) {
      // client-side error
      msg = error.error.message;
    } else {
      // server-side error
      msg = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(msg);
  }
}