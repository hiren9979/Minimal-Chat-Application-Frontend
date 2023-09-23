import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Token } from '@angular/compiler';
import { ToastrService } from 'ngx-toastr';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'https://localhost:7275/api/User';

  constructor(
    private http: HttpClient,
    private toastr : ToastrService,

    ) { }

  signup(user:any):Observable<any>{
      return this.http.post(`${this.apiUrl}/Register`,user);
  }

  login(user:any):Observable<any>{
      return this.http.post(`${this.apiUrl}/Login`,user);
  }

  getUserList(headers: HttpHeaders):Observable<any>{
    return this.http.get(`${this.apiUrl}/GetUsers`, { headers});
  }

  getToken(): string | null {
    const user = localStorage.getItem('user');
    if (user) {
      const jsonObject = JSON.parse(user);
      if(jsonObject.token===null) {
        this.toastr.error("Authorization failed - Token null", 'error');
      }
      return jsonObject.token;
    }
    return null;
  }
  

}
