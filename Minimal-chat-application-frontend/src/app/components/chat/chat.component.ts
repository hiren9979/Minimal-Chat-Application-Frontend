import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { AuthService } from 'src/app/service/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { ChatService } from 'src/app/service/chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent {
  userList: any[] = [];
  selectedUser: any = null; // To store the selected user
  messageText: string = ''; // To store the message text

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router,
    private chatService : ChatService
    
  ) {}

  ngOnInit(): void {
    this.fetchUserList();
  }

  startChat(user: any) {
    // Set the selected user when a user is clicked
    this.selectedUser = user;
    console.log(this.selectedUser);
    this.fetchConversationHistory();
  }

  fetchUserList() {
    const token = this.authService.getToken(); // Get the JWT token from AuthService

    if (token) {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });

      this.authService.getUserList(headers).subscribe(
        (response) => {
          console.log('User list fetch successful:', response);
          this.toastr.success('User list fetch successful!', 'Success');
          this.userList = response.users;
          console.log(this.userList);
        },
        (error) => {
          this.toastr.error('User list fetch failed!', 'Error');
          console.log('User list fetch failed:', error);
        }
      );
    }
  }

  fetchConversationHistory(){
    var senderId;
    const sort = 'desc'; 
    const time = new Date(); 
    const count = 20; 

    if (this.selectedUser) {
      // Check if a user is selected

      const user = localStorage.getItem('user');
      if (user) {
        const jsonObject = JSON.parse(user);
        senderId = jsonObject.profile.id; 
      }

       // Get the JWT token from AuthService
       const token = this.authService.getToken();

       if (token) {
         // Create headers with the Authorization header containing the JWT token
         const headers = new HttpHeaders({
           Authorization: `Bearer ${token}`,
         });
         
      const receiverId = this.selectedUser.id;

      // Use your chat service to fetch conversation history
      this.chatService.getConversationHistory(senderId, receiverId, sort, time, count,headers).subscribe(
        (response) => {
          // Handle success, e.g., display the conversation history
          console.log('Conversation history:', response);

          // You can update the chat-messages section with the conversation history here
          // For example, assign the response to a variable and display it in the template
        },
        (error) => {
          console.log('Error fetching conversation history:', error);
        }
      );
    }
  }
  }
}
