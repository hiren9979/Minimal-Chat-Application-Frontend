import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Token } from '@angular/compiler';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from './auth.service';



@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'https://localhost:7275/api/Message';

  constructor(
    private http: HttpClient,
    private authService : AuthService
    ) { }

  getConversationHistory(
    senderId: string,
    receiverId: string,
    sort: string,
    time: Date,
    count: number,
    headers:HttpHeaders
  ): Observable<any> {
    const params = new HttpParams()
      .set('receiverId', receiverId)
      .set('sort', sort)
      .set('time', time.toISOString())
      .set('count', count.toString());

      return this.http.get(`${this.apiUrl}/ConversationHistory`, { headers,params });
  }

  // Create a method to send a message to a specific user
  sendMessageToUser(message: any,receiverId:string,headers:HttpHeaders): Observable<any> {
    const body = {
      ReceiverId: receiverId,
      Content: message.messageText
    };

      const options = {body,headers}

      // Make a POST request to send the message
      return this.http.post(`${this.apiUrl}/SendMessages`, body,{headers});
  }

  editMessage(messageId: number, editedContent: string, headers: HttpHeaders): Observable<any> {
    const body = {
      Content: editedContent
    };

    // Make a POST request to edit the message
    return this.http.post(`${this.apiUrl}/EditMessage/${messageId}`, body, { headers });
  }

  deleteMessage(messageId: number, headers: HttpHeaders): Observable<any> {
    // Make a DELETE request to delete the message
    return this.http.delete(`${this.apiUrl}/DeleteMessage/${messageId}`, { headers });
  }

}
