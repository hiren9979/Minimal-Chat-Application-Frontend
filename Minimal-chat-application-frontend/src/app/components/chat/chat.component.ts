import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/service/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { ChatService } from 'src/app/service/chat.service';
import { FormBuilder, FormGroup , Validators} from '@angular/forms';
import { ClassProvider, FactoryProvider, InjectionToken, PLATFORM_ID } from '@angular/core';
import { Inject } from '@angular/core';

/* Create a new injection token for injecting the window into a component. */
export const WINDOW = new InjectionToken('WindowToken');



@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit {

  @ViewChild('chatContainer', { static: false }) chatContainer!: ElementRef;


  sendMessageForm!: FormGroup;

  userList: any[] = [];
  selectedUser: any = null; // To store the selected user
  messageText: string = ''; // To store the message text
  conversationHistory : any[] =  [];  //To store the conversation history with user
  wholeConversation : any[] = []; //To store the whole conversation
  receiverName : string = '';
  receiverId : string = '';
  time = new Date(); 

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router,
    private chatService : ChatService,
    @Inject(WINDOW) private window: Window,

  ) {}

  ngOnInit(): void {
    this.fetchUserList();

    // this.chatMessages.nativeElement.addEventListener('scroll', () => {
    //   this.onScroll();
    // });

    this.sendMessageForm = this.fb.group({
      messageText: ['', [Validators.required]],
    });
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
    const sort = 'asc'; 
    var count = 20;
    
    if (this.selectedUser) {
      // Check if a user is selected
      this.receiverName = this.selectedUser.firstName;
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
         
       this.receiverId = this.selectedUser.id;
      

      // Use your chat service to fetch conversation history
      this.chatService.getConversationHistory(senderId, this.receiverId, sort, this.time, count,headers).subscribe(
        (response) => {
          this.conversationHistory = response.messages.reverse();
          console.log(this.conversationHistory);
          
         // Prepend conversationHistory to wholeConversation
         this.wholeConversation.unshift(...this.conversationHistory);

          this.time = new Date(response.messages[0].timestamp);
          console.log(this.time);

          console.log("fetched" , this.conversationHistory);
          this.toastr.success('Conversation history retrieved!', 'Success');
          
          console.log('Conversation history:', response);
          
        },
        (error) => {
          console.log('Error fetching conversation history:', error);
        }
      );
    }
  }
  }

  // @HostListener('window:scroll', ['$event'])
  //   onScroll(event: Event) {
  //     console.log("Scroll event triggered");
  //     const scrollY = this.window.scrollY;
  
  //     if (this.chatContainer) {
  //       const chatContainerElement = this.chatContainer.nativeElement;
  //       const threshold = 100;
  
  //       if (scrollY <= threshold) {
  //         alert("calledd");
  //         console.log('Scroll event triggered inside chatContainer');
  //       }
  //     }
  //   }

  @HostListener('scroll', ['$event'])
  onScroll(event: Event){
    console.log('Scroll event detected');
    const element = event.target as HTMLElement;
    if(element.scrollTop === 0){
       this.fetchConversationHistory();
      
    }
  }

  onSubmit()
  {
    console.log(this.sendMessageForm.value);
    console.log(this.receiverId);
    if(this.sendMessageForm.valid)
    {
      const msg = this.sendMessageForm.value;
     
      // Get the JWT token from AuthService
    const token = this.authService.getToken();

    if (token) {
      // Create headers with the Authorization header containing the JWT token
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      this.chatService.sendMessageToUser(msg,this.receiverId,headers).subscribe(
        (response) => {
          console.log('Message Sent successful:', response);
          this.toastr.success('Message sent successful!', 'Success');
          this.time = new Date();
          this.wholeConversation = [];
          this.fetchConversationHistory(); 
          this.sendMessageForm.reset();
        },
        (error) => {
          this.toastr.error('Message Sent failed!', 'Error');
          console.log('Message Sent failed:', error);
        }
      );
    }
  }
  }
}
