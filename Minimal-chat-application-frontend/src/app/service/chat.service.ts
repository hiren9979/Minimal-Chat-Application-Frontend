import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Token } from '@angular/compiler';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from './auth.service';
import * as signalR from '@microsoft/signalr';



@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'https://localhost:7288/api/Message';
  hubConnection!: signalR.HubConnection;

  constructor(
    private http: HttpClient,
    private authService : AuthService
    ) {
      if (
        !this.hubConnection ||
        this.hubConnection.state === signalR.HubConnectionState.Disconnected
      ) {
        this.hubConnection = new signalR.HubConnectionBuilder()
          .withUrl('https://localhost:7288/chatHub')
          .withAutomaticReconnect()
          .build();
        this.startSignalRConnection();
      }
     }

     // Check if the HubConnection is in the 'Disconnected' state.
  isConnectionDisconnected(): boolean {
    return this.hubConnection.state === signalR.HubConnectionState.Disconnected;
  }


     private startSignalRConnection(): void {
      this.hubConnection
        .start()
        .then(() => {
          console.log('SignalR connection started');
        })
        .catch((err) => {
          console.error('Error while starting SignalR connection: ' + err);
        });
    }
  
    startConnection(): void {
      this.hubConnection
        .start()
        .then(() => {
          console.log('Connection started');
        })
        .catch((err) => {
          console.error('Error while starting connection: ' + err);
        });
    }

    /**
   * Retrieves a JSON Web Token (JWT) from local storage.
   *
   * @returns The JWT token as a string if it's stored in local storage, or null if not found.
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getConversationHistory(
    senderId: string,
    receiverId: string,
    sort: string,
    time: Date,
    count: number,
  ): Observable<any> {
    let headers;
     // Get the JWT token from AuthService
     const token = this.authService.getToken();

     if (token) {
     headers = new HttpHeaders({    
      Authorization: `Bearer ${token}`,
    });
  }

     // Convert the Date object to an ISO string while preserving the local timezone
  const isoTime = this.toLocalISOString(time);

    const params = new HttpParams()
      .set('receiverId', receiverId)
      .set('sort', sort)
      .set('time',  isoTime)
      .set('count', count.toString());

      return this.http.get(`${this.apiUrl}/ConversationHistory`, { headers,params });
  }

  private toLocalISOString(date: Date): string {
    const tzo = -date.getTimezoneOffset(),
        dif = tzo >= 0 ? '+' : '-',
        pad = (num: number) => {
            const norm = Math.floor(Math.abs(num));
            return (norm < 10 ? '0' : '') + norm;
        };
    return date.getFullYear() +
        '-' + pad(date.getMonth() + 1) +
        '-' + pad(date.getDate()) +
        'T' + pad(date.getHours()) +
        ':' + pad(date.getMinutes()) +
        ':' + pad(date.getSeconds()) +
        dif + pad(tzo / 60) +
        ':' + pad(tzo % 60);
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

  searchHistory(query:any) : Observable<any>{
    let headers;
     // Get the JWT token from AuthService
     const token = this.authService.getToken();

     if (token) {
     headers = new HttpHeaders({    
      Authorization: `Bearer ${token}`,
    });
  }

    return this.http.get(`${this.apiUrl}/SearchConversations?query=${query}`, { headers });
  }

  // Add a method to handle edited messages received from the server
}
