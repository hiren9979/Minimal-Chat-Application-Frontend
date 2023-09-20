import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'https://localhost:7275/api/User';

  constructor(private http: HttpClient) { }

  signup(user:any):Observable<any>{
      return this.http.post(`${this.apiUrl}/Register`,user);
  }

  login(user:any):Observable<any>{
      return this.http.post(`${this.apiUrl}/Login`,user);
  }

}
