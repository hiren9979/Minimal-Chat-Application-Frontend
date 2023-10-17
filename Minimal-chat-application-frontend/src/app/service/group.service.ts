import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class GroupService {

  constructor(private http: HttpClient,
    private authService: AuthService) {}

  private apiUrl = 'https://localhost:7288/api/GroupChat'; 

  createGroup(model: any): Observable<any> {
    let headers;
     // Get the JWT token from AuthService
     const token = this.authService.getToken();

     if (token) {
     headers = new HttpHeaders({    
      Authorization: `Bearer ${token}`,
    });
  }
  const options = { headers: headers };

    return this.http.post(`${this.apiUrl}/CreateGroup`, model, options);
  }

  // Method to get the list of created groups
  getGroupList(headers: HttpHeaders) {
    const url = `${this.apiUrl}/groups`; // Replace with your actual endpoint
    return this.http.get(`${this.apiUrl}/GetAllGroups`, { headers });
  }
}
