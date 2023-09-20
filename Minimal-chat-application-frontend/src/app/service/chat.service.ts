import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Token } from '@angular/compiler';


@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'https://localhost:7275/api/Message';

  constructor(private http: HttpClient) { }

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

    const options = { headers, params };

      return this.http.get(`${this.apiUrl}/ConversationHistory`, { headers,params });
  }

}
