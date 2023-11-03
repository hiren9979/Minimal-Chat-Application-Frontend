import { Injectable } from '@angular/core';
import { Subject , BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class RealTimeMessageService {

  constructor() { }

  private conversationHistory: any[] = [];
  private conversationHistorySubject = new Subject<any[]>();

  getConversationHistory() {
    return this.conversationHistory;
  }

  addMessageToHistory(message: any) {
    this.conversationHistory.push(message);
    this.conversationHistorySubject.next([...this.conversationHistory]);
    console.log("conversatino history in signalR addMessgeHistory method ",this.conversationHistory);
  }

  getConversationHistoryObservable() {
    return this.conversationHistorySubject.asObservable();
  }

  updateEmoji(message:any)
  {
    const messageIndex = this.conversationHistory.findIndex((msg) => msg.id === message.id);
    if (messageIndex !== -1) {
      this.conversationHistory[messageIndex] = message;
    }

    this.conversationHistorySubject.next([...this.conversationHistory]);
    console.log("conversation history after update emoji : " , this.conversationHistory);
    
  }


}
