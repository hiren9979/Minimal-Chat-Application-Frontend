import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  ChangeDetectorRef,
  ElementRef,
  Component,
  HostListener,
  ViewChild,
  Input,
  OnInit,
  OnChanges,
} from '@angular/core';
import { AuthService } from 'src/app/service/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { ChatService } from 'src/app/service/chat.service';
import { ChatComponent } from '../chat/chat.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GroupService } from 'src/app/service/group.service';

@Component({
  selector: 'chat-with-user',
  templateUrl: './chat-with-user.component.html',
  styleUrls: ['./chat-with-user.component.css'],
})
export class ChatWithUserComponent implements OnInit {
  editGroupNameForm!: FormGroup;

  @Input() conversationHistory: any[] = [];
  @Input() receiverName: string = '';
  @Input() receiverId: string = '';
  loggedinUserId: string = '';
  isOpenPopUp: boolean = false;
  searchText: string = '';
  originalMessages: any[] = this.conversationHistory;

  editingMessageId: number | null = null; // Track the message being edited
  editedMessageContent: string = ''; // Store the edited content

  isGroupNameEditPopupOpen = false;
  isShowMemberPopupOpen = false;
  groupName: string = '';
  editedGroupName = '';

  gropuAdminId = '';

  groupMemberUsernames: { userName: string, userId: string }[] = [];

  @Input() isUserSelected: boolean = false;

  @ViewChild('forScrolling') forScrolling!: ElementRef;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router,
    private groupService: GroupService,
    private fb: FormBuilder,
    private chatService: ChatService,
    private cdRef: ChangeDetectorRef,
    private chatComponent: ChatComponent
  ) {}

  ngOnInit() {
    const user = localStorage.getItem('user');
    if (user) {
      const jsonObject = JSON.parse(user);
      this.loggedinUserId = jsonObject.profile.id;
      console.log('LoggedInUserId : ', this.loggedinUserId);
    }
    this.originalMessages = this.conversationHistory.slice();
    this.cdRef.detectChanges();

    this.editGroupNameForm = this.fb.group({
      groupName: ['', Validators.required], // You can add more validators if needed
    });
  }

  private handleEditedMessage(editedMessage: any): void {
    const index = this.conversationHistory.findIndex(
      (message) => message.id === editedMessage.id
    );

    if (index !== -1) {
      this.conversationHistory[index].content = editedMessage.content;
    }
  }

  // Method to handle incoming deleted messages from SignalR
  private handleDeletedMessage(deletedMessageId: number): void {
    const index = this.conversationHistory.findIndex(
      (message) => message.id === deletedMessageId
    );

    if (index !== -1) {
      this.conversationHistory.splice(index, 1);
    }
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
    debugger;
    // Check if editingMessageId is not null before proceeding
    if (this.editingMessageId !== null) {
      // Find the message by messageId and set the editedMessageContent
      const editedMessage = this.conversationHistory.find(
        (message) => message.id === messageId
      );
      if (editedMessage) {
        this.editedMessageContent = editedMessage.content;
        // Call editMessagesignal only if editingMessageId is not null
        this.chatService.hubConnection.on(
          'EditMessage',
          (messageId: number, content: string) => {
            console.log('edit message log');
            this.chatComponent.fetchConversationHistory();
          }
        );
        this.handleEditedMessage(this.editedMessageContent);
      }
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
        this.chatService
          .editMessage(
            this.editingMessageId,
            this.editedMessageContent,
            headers
          )
          .subscribe(
            (response) => {
              // Handle the success response, e.g., update the UI with the edited message.
              console.log('Message edited successfully:', response);

              // Update the conversationHistory array with the edited message
              const editedMessageIndex = this.conversationHistory.findIndex(
                (message) => message.id === this.editingMessageId
              );
              if (editedMessageIndex !== -1) {
                this.conversationHistory[editedMessageIndex].content =
                  this.editedMessageContent;
              }

              if (this.editingMessageId != null)
                this.editMessage(this.editingMessageId);

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
          this.handleDeletedMessage(messageId);
          this.toastr.success('Message deleted successfully', 'success');
          // Find the index of the deleted message in conversationHistory
          const deletedMessageIndex = this.conversationHistory.findIndex(
            (message) => message.id === messageId
          );
          if (deletedMessageIndex !== -1) {
            this.conversationHistory.splice(deletedMessageIndex, 1); // Remove the message
          }
        },
        (error) => {
          this.toastr.error('Error while delete message', 'error');
          console.error('Error deleting message:', error);
        }
      );
    }
  }

  openPopUp(messageId: number) {
    this.isOpenPopUp = true;
    // Set the editingMessageId to the messageId to indicate which message is being edited
    this.editingMessageId = messageId;

    // Find the message by messageId and set the editedMessageContent
    const editedMessage = this.conversationHistory.find(
      (message) => message.id === messageId
    );
    if (editedMessage) {
      this.editedMessageContent = editedMessage.content;
    }
  }

  openEditPopup() {
    this.isGroupNameEditPopupOpen = true;
    this.groupName = this.receiverName;
    console.log(this.groupName);
    console.log(this.isGroupNameEditPopupOpen);
  }

  editGroupName() {
    if (this.editGroupNameForm.valid) {
      const updatedGroupName = this.editGroupNameForm.value.groupName;
      const groupId = this.receiverId; // Replace with the actual group ID
      console.log("Group Id : ", groupId);
      

      this.groupService.editGroupName(groupId, updatedGroupName).subscribe(
        (response) => {
          console.log('Group name updated successfully', response);
          this.toastr.success('GroupName Updated successfully', 'success');
          this.closeGroupNameEditPopup();
          this.chatComponent.fetchGroupList();
        },
        (error) => {
          this.toastr.error('Error while updating group name', 'error');
          console.log('Error updating group name', error);
        }
      );
    }
  }

  closeGroupNameEditPopup() {
    this.isGroupNameEditPopupOpen = false;
  }

  openShowMemberPopup()
  {
     this.isShowMemberPopupOpen = true;
     this.fetchGroupMembers();
  }

  fetchGroupMembers() {
    const groupId = this.receiverId; // Replace with the actual group ID
  
    this.groupService.fetchGroupMembers(groupId).subscribe(
      (response : any) => {
        // Handle the retrieved group members, e.g., display them in your UI.
        this.groupMemberUsernames = response;

        console.log(this.groupMemberUsernames);
        
        const groupAdminMember = this.groupMemberUsernames.find((member : any) => member.isAdmin === true);

        console.log("Group Admin : ", groupAdminMember);
        

      if (groupAdminMember) {
        this.gropuAdminId = groupAdminMember.userId;
        console.log('Group admin UserId:', this.gropuAdminId);
      }

        console.log('Group members:', this.groupMemberUsernames);
      },
      (error) => {
        this.toastr.error('Error while fetching group members', 'error');
        console.error('Error fetching group members:', error);
      }
    );
  }
  

  closeShowMemberPopup()
  {
    this.isShowMemberPopupOpen = false;
  }
  saveGroupName() {
    this.closeGroupNameEditPopup();
  }

  removeGroupMember(userId: string) {
   
    const removeMembersDTO = {
      MemberIds: [userId], 
      AdminUserId:  this.gropuAdminId , 
    };

    const groupId = this.receiverId;
   
    this.groupService.removeGroupMembers(groupId, removeMembersDTO,).subscribe(
      (response) => {
        // Handle a successful response here
        console.log('Group members removed:', response);
        this.toastr.success('Group Member removed successfully !!!', 'success');
        this.fetchGroupMembers();
      },
      (error) => {
        // Handle errors here
        console.error('Error removing group members:', error);
        this.toastr.error('Error while removing group members', 'error');

      }
    );
  }
  

}
