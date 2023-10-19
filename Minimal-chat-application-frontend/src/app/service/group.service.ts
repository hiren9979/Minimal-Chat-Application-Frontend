import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  constructor(private http: HttpClient, private authService: AuthService) {}

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

  editGroupName(GroupId: string, UpdatedGroupName: string) {
    let headers: HttpHeaders = new HttpHeaders();
    // Get the JWT token from AuthService
    const token = this.authService.getToken();

    if (token) {
      headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });
    } else {
      // Handle the case where there is no token (authentication issue)
      // You may want to return an Observable or throw an error here.
    }

    const url = `${this.apiUrl}/editGroupName`;
    const model = {
      GroupId: GroupId,
      UpdatedGroupName: UpdatedGroupName,
    };
    return this.http.put(url, null, { params: model });
  }

  fetchGroupMembers(groupId: string): Observable<any[]> {
    const url = `${this.apiUrl}/fetchGroupMembers`; // Replace with your API endpoint
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.get<any[]>(url, { headers, params: { groupId } });
  }

  removeGroupMembers(groupId: string,removeMembers : any) {
    const removeMembersDTO = new HttpParams()
    .set('MemberIds', removeMembers.MemberIds.join(',')) // assuming MemberIds is an array
    .set('AdminUserId', removeMembers.AdminUserId);
    return this.http.delete(`${this.apiUrl}/${groupId}/remove-members`, { params:removeMembersDTO } );
  }

}
