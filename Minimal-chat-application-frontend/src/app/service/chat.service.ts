import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Token } from '@angular/compiler';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from './auth.service';
import * as signalR from '@microsoft/signalr';
import { RealTimeMessageService } from './real-time-message.service';



@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'https://localhost:7288/api/Message';
  hubConnection!: signalR.HubConnection;

  constructor(
    private http: HttpClient,
    private authService : AuthService,
    private sharedChatService: RealTimeMessageService
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


     public startSignalRConnection(): void {
      this.hubConnection
        .start()
        .then(() => {
          console.log('SignalR connection started');
        })
        .catch((err) => {
          console.error('Error while starting SignalR connection: ' + err);
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
    receiverId: string,
    sort: string,
    time: Date,
    count: number,
    isGroup: boolean
  ): Observable<any> {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
  
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
  
    const isoTime = this.toLocalISOString(time);
  
    const params = new HttpParams()
      .set('receiverId', receiverId)
      .set('sort', sort)
      .set('time', isoTime)
      .set('count', count)
      .set('isGroup', isGroup);
  
    return this.http.get(`${this.apiUrl}/ConversationHistory`,  {headers,params});
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


editMessagesignal(messageId: number,content: string): void {
  debugger
  this.hubConnection.invoke('EditMessage',messageId, content)
    .catch(err => console.error(err));
}
deleteMessagesignal(messageId: number): void {
  this.hubConnection.invoke('DeleteMessage', messageId)
    .catch(err => console.error(err));
}

  // Create a method to send a message to a specific user
  sendMessageToUser(message: any,receiverId:string,headers:HttpHeaders): Observable<any> {
    const body = {
      ReceiverId: receiverId,
      Content: message.messageText
    };

      const options = {body,headers}

      // Make a POST request to send the message
      return this.http.post(`${this.apiUrl}/messages`, body,{headers});
  }

  
  sendMessageSignalR(message:any)
  {
    this.hubConnection.invoke('SendMessage',message)
    .catch(err => console.error(err));
    
    this.sharedChatService.addMessageToHistory(message);

    console.log("Hi sending message : ",message); 
  }


  updateEmojiSignalR(message:any)
  {
    this.hubConnection.invoke('UpdateEmoji',message)
    .catch(err => console.error(err));

    this.sharedChatService.updateEmoji(message);

  }

  receiverEmojiSignalR(): Observable<any> {
    return new Observable<any>(observer => {
      this.hubConnection.on('ReceiveEmoji', (data: any) => {
        observer.next(data);
  
        console.log("Hi received message : ",data);
  
      });
      
    });
  }


receiveMessageSignalR(): Observable<any> {
  return new Observable<any>(observer => {
    this.hubConnection.on('ReceiveMessage', (data: any) => {
      observer.next(data);

      console.log("Hi received message : ",data);

    });
    
  });
}
  editMessage(messageId: number, editedContent: string, headers: HttpHeaders): Observable<any> {
    const body = {
      Content: editedContent
    };

    // Make a POST request to edit the message
    return this.http.post(`${this.apiUrl}/messages/${messageId}`, body, { headers });
  }

  deleteMessage(messageId: number, headers: HttpHeaders): Observable<any> {
    // Make a DELETE request to delete the message
    return this.http.delete(`${this.apiUrl}/messages/${messageId}`, { headers });
  }

  searchHistory(query:any,receiverId:string) : Observable<any>{
    let headers;
     // Get the JWT token from AuthService
     const token = this.authService.getToken();

     if (token) {
     headers = new HttpHeaders({    
      Authorization: `Bearer ${token}`,
    });
  }

    return this.http.get(`${this.apiUrl}/SearchConversations?query=${query}&receiverId=${receiverId}`, { headers });
  }

addEmojiReaction(messageId: number,userId : string, emoji: string): Observable<any> {
    const url = 'https://localhost:7288/api/EmojiReaction/AddEmoji'
    const body = {
      MessageId: messageId,
      UserId : userId,
      emoji: emoji
    };

    return this.http.post(url, body);
  }

}
