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
import { Location } from '@angular/common';
import { RealTimeMessageService } from 'src/app/service/real-time-message.service';


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

  groupMemberUsernames: { userName: string; userId: string }[] = [];

  isRemoveOrAdminPopupOpen: boolean = false;

  selectedMember: any;

  @Input() isUserSelected: boolean = false;
  isDropdownOpen: boolean = false;

  isAddGroupMemberPopupOpen : boolean = false;
  userNotInGroup!: any[];
  wantToAddMembers: string[] = [];


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
    private chatComponent: ChatComponent,
    private location : Location,
    private sharedChatService : RealTimeMessageService,
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

    console.log(this.conversationHistory);

    this.conversationHistory = this.conversationHistory.filter(
      (message, index, self) =>
        self.findIndex((m) => m.id === message.id) === index
    );

    console.log("After conversationHistory : ",this.conversationHistory);
    

    this.chatService.receiveMessageSignalR().subscribe((message: any) => {
      debugger   
      // this.conversationHistory.push(message);
      console.log(this.conversationHistory);
      console.log("New message", message)

      this.sharedChatService.getConversationHistory();

      this.sharedChatService.getConversationHistoryObservable().subscribe((history: any[]) => {
        // Handle updates to the conversation history in real-time
        this.conversationHistory = history;
      });

      console.log("updated : ",this.conversationHistory);  
    });
  }

  makeAtMentionsBold(content: string): string {

    if (content.startsWith("[[]]")) {
      content = content.slice(4);
    }
    
    const words = content.split(' '); // Split the content into words
    const processedContent = words.map((word) => {
      if (word.startsWith('@')) {
        return `<strong class="bold-white">${word}</strong>`; // Wrap @-prefixed words in <strong> tags
      } else {
        return word;
      }
    });
    return processedContent.join(' '); // Join the words back into a string
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
              this.closeEditPopup();
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
    this.closeEditPopup();
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

  closeEditPopup()
  {
    this.isGroupNameEditPopupOpen = false;
  }

  editGroupName() {
    if (this.editGroupNameForm.valid) {
      const updatedGroupName = this.editGroupNameForm.value.groupName;
      const groupId = this.receiverId; // Replace with the actual group ID
      console.log('Group Id : ', groupId);

      this.groupService.editGroupName(groupId, updatedGroupName).subscribe(
        (response) => {
          console.log('Group name updated successfully', response);
          this.toastr.success('GroupName Updated successfully', 'success');

          this.closeGroupNameEditPopup();

          window.location.reload();
          // this.chatComponent.fetchGroupList();
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

  openShowMemberPopup() {
    this.isShowMemberPopupOpen = true;
    this.fetchGroupMembers();
  }

  fetchGroupMembers() {
    const groupId = this.receiverId; // Replace with the actual group ID

    this.groupService.fetchGroupMembers(groupId).subscribe(
      (response: any) => {
        // Handle the retrieved group members, e.g., display them in your UI.
        this.groupMemberUsernames = response;

        console.log(this.groupMemberUsernames);

        const groupAdminMember = this.groupMemberUsernames.find(
          (member: any) => member.isAdmin === true
        );

        console.log('Group Admin : ', groupAdminMember);

        if (groupAdminMember) {
          this.gropuAdminId = groupAdminMember.userId;
          console.log('Group admin UserId:', this.gropuAdminId);
        }

        console.log('Group members:', this.groupMemberUsernames);
        return this.groupMemberUsernames;
      },
      (error) => {
        this.toastr.error('Error while fetching group members', 'error');
        console.error('Error fetching group members:', error);
      }
    );
  }

  closeShowMemberPopup() {
    this.isShowMemberPopupOpen = false;
  }

  saveGroupName() {
    this.closeGroupNameEditPopup();
  }

  removeGroupMember(member: any) {
    const removeMembersDTO = {
      MemberIds: [member.userId],
      AdminUserId: this.gropuAdminId,
    };

    const groupId = this.receiverId;

    this.groupService.removeGroupMembers(groupId, removeMembersDTO).subscribe(
      (response) => {
        // Handle a successful response here
        console.log('Group members removed:', response);

        this.toastr.success(`${this.selectedMember.userName} is remove from ${this.receiverName} group`, 'success');
        this.closeRemoveOrAdminPopup();
        this.fetchGroupMembers();
      },
      (error) => {
        // Handle errors here
        console.error('Error removing group members:', error);
        this.toastr.error('Error while removing group members', 'error');
      }
    );
  }

  openRemoveOrAdminPopup(member: any) {
    this.isRemoveOrAdminPopupOpen = true; 
    this.selectedMember = member;
  }

  closeRemoveOrAdminPopup() {
    this.isRemoveOrAdminPopupOpen = false;
  }

  makeUserAdmin() {
    console.log("groupId : ", this.receiverId);
    console.log("userId : ", this.selectedMember.userId);
    
    
    // Call the service method to make the selected member an admin
    this.groupService.makeUserAdmin(this.receiverId, this.selectedMember.userId).subscribe(
      (response) => {
        console.log('User made admin successfully',this.selectedMember);
        console.log(this.receiverName);

        this.toastr.success(`${this.selectedMember.userName} is now admin of ${this.receiverName} group`, 'success');
        this.closeRemoveOrAdminPopup();
      },
      (error) => {
        console.error('Failed to make the user admin', error);

        if (error.status === 500 || error.error.error === "You are not authorized to make this user an admin") {
          // Handle the specific case where the user is not authorized to make the user an admin
          this.toastr.error('You are not authorized to make this user an admin', 'error');
        } else {  
          // Handle other error cases
          this.toastr.error('Error while making group member admin', 'error');
        }
      }
    );
  }

toggleDropdown() {
  this.isDropdownOpen = true;
  console.log(this.isDropdownOpen);
  
}

fetchUsersNotInGroup()
{

  console.log("receiver id " , this.receiverId);
  
  this.groupService.fetchUsersNotInGroupService(this.receiverId).subscribe(
    (response) => {  
      this.userNotInGroup = response as any[];
      console.log('Users not in the group:', this.userNotInGroup);
    },
    (error) => {
      console.error('Error fetching users not in the group:', error);
    }
  );
}

openAddGroupMemberPopup(){
  this.isAddGroupMemberPopupOpen = true;
  this.fetchUsersNotInGroup();
}

closeAddGroupMemberPopup(){

  this.userNotInGroup.forEach(user => {
    user.isMemberAdded = false;
  });
  this.isAddGroupMemberPopupOpen = false;
}

addedGroupMember(userId:string){
  const index = this.wantToAddMembers.indexOf(userId);
  if (index !== -1) {
    // User is already added, remove them
    this.wantToAddMembers.splice(index, 1);
  } else {
    // User is not added, add them
    this.wantToAddMembers.push(userId);
  }
  console.log(this.wantToAddMembers);
  
}
  
isMemberAdded(userId: string): boolean {
  return this.wantToAddMembers.includes(userId);
}

AddMembersInGroup()
{
  this.groupService.addGroupMembers(this.receiverId, this.wantToAddMembers).subscribe(
    (response) => {
      // Handle the success response here
      console.log('Members added successfully:', response);
      this.toastr.success(`Members added successfully in ${this.receiverName}`, 'Success');
      this.closeAddGroupMemberPopup();
      // Clear the selected members from wantToAddMembers
      this.wantToAddMembers = [];
    },
    (error) => {
      this.toastr.error('Error while adding members','error');
      // Handle errors here
      console.error('Error adding members to the group:', error);
    }
  );

}

}
