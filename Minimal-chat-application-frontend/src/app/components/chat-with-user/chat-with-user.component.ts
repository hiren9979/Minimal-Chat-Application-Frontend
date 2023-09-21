import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { AuthService } from 'src/app/service/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { ChatService } from 'src/app/service/chat.service';


@Component({
  selector: 'chat-with-user',
  templateUrl: './chat-with-user.component.html',
  styleUrls: ['./chat-with-user.component.css']
})
export class ChatWithUserComponent implements OnInit{
    @Input() conversationHistory : any[] = [];
    @Input() receiverName : string = '';
    loggedinUserId : string = '';

    constructor(
      private http: HttpClient,
      private authService: AuthService,
      private toastr: ToastrService,
      private router: Router,
      private chatService : ChatService,
      private cdRef: ChangeDetectorRef
      
    ) {}

    ngOnInit(){
      const user = localStorage.getItem('user');
      if (user) {
        const jsonObject = JSON.parse(user);
        this.loggedinUserId = jsonObject.profile.id; 
        console.log("LoggedInUserId : ",this.loggedinUserId);
      }
      this.cdRef.detectChanges();

    }

}
