import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, ElementRef, Component, HostListener,ViewChild , Input, OnInit, OnChanges } from '@angular/core';
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

    editingMessageId: number | null = null; // Track the message being edited
    editedMessageContent: string = ''; // Store the edited content
  

    @ViewChild('forScrolling') forScrolling!: ElementRef;


    constructor(
      private http: HttpClient,
      private authService: AuthService,
      private toastr: ToastrService,
      private router: Router,
      private chatService : ChatService,
      private cdRef: ChangeDetectorRef,
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

    ngAfterViewChecked(): void {
      // Detect changes and scroll to the bottom when new messages are added
      this.cdRef.detectChanges();
      this.scrollToBottom();
    }

    scrollToBottom() {
      if (this.forScrolling) {
        const chatContainerElement = this.forScrolling.nativeElement;
        chatContainerElement.scrollTop = chatContainerElement.scrollHeight;
      }
    }

    editMessage(messageId: number) {
      // Set the editingMessageId to the messageId to indicate which message is being edited
      this.editingMessageId = messageId;
      
      // Find the message by messageId and set the editedMessageContent
      const editedMessage = this.conversationHistory.find(message => message.id === messageId);
      if (editedMessage) {
        this.editedMessageContent = editedMessage.content;
      }
    }

    saveEditedMessage() {

       // Get the JWT token from AuthService
       const token = this.authService.getToken();

       if (token) {
         // Create headers with the Authorization header containing the JWT token
         const headers = new HttpHeaders({
           Authorization: `Bearer ${token}`,
         });
         

      if (this.editingMessageId !== null) {
        // Call the EditMessage API with the edited content
        this.chatService.editMessage(this.editingMessageId, this.editedMessageContent,headers).subscribe(
          (response) => {
            // Handle the success response, e.g., update the UI with the edited message.
            console.log('Message edited successfully:', response);
    
            // Update the conversationHistory array with the edited message
            const editedMessageIndex = this.conversationHistory.findIndex(message => message.id === this.editingMessageId);
            if (editedMessageIndex !== -1) {
              this.conversationHistory[editedMessageIndex].content = this.editedMessageContent;
            }
            
            // Reset the editing state
            this.editingMessageId = null;
            this.editedMessageContent = '';
          },
          (error) => {
            // Handle the error response, e.g., display an error message.
            console.error('Error editing message:', error);
          }
        );
      }
    }
  }
    
  cancelEdit() {
      // Reset the editing state when the user cancels editing
      this.editingMessageId = null;
      this.editedMessageContent = '';
    }

    deleteMessage(messageId: number) {
      // Get the JWT token from AuthService
      const token = this.authService.getToken();
  
      if (token) {
        // Create headers with the Authorization header containing the JWT token
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
        });
  
        // Call the DeleteMessage API with the message ID
        this.chatService.deleteMessage(messageId, headers).subscribe(
          (response) => {
            // Handle the success response, e.g., remove the deleted message from conversationHistory.
            console.log('Message deleted successfully:', response);
            this.toastr.success("Message deleted successfully",'success');
            // Find the index of the deleted message in conversationHistory
            const deletedMessageIndex = this.conversationHistory.findIndex((message) => message.id === messageId);
            if (deletedMessageIndex !== -1) {
              this.conversationHistory.splice(deletedMessageIndex, 1); // Remove the message
            }
          },
          (error) => {
            this.toastr.error('Error while delete message','error');
            console.error('Error deleting message:', error);
          }
        );
      }

  }

}