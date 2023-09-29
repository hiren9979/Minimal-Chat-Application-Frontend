import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Token } from '@angular/compiler';
import { ToastrService } from 'ngx-toastr';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'https://localhost:7288/api/User';

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

  loginWithGoogle(credential: string) {
  const header = new HttpHeaders().set('Content-type', 'application/json');

  return this.http.post(`${this.apiUrl}/LoginWithGoogle`, JSON.stringify(credential), { headers: header, withCredentials: true });
  }
  
 

  getUserList(headers: HttpHeaders):Observable<any>{
    return this.http.get(`${this.apiUrl}/GetUsers`, { headers});
  }

  getToken(): string | null {
    const user = localStorage.getItem('user');
    if (user) {
      const jsonObject = JSON.parse(user);
      if (jsonObject && jsonObject.token !== null) {
        return jsonObject.token;
      } else {
        this.toastr.error("Authorization failed - Token is null or undefined", 'error');
      }
    }
    return null;
  }
  
  

}
