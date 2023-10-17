import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { AuthService } from 'src/app/service/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { ChatService } from 'src/app/service/chat.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  ClassProvider,
  FactoryProvider,
  InjectionToken,
  PLATFORM_ID,
} from '@angular/core';
import { Inject } from '@angular/core';
import { GroupService } from 'src/app/service/group.service';

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
  createGroupForm!: FormGroup;

  userList: any[] = [];
  selectedUser: any = null; // To store the selected user
  messageText: string = ''; // To store the message text
  conversationHistory: any[] = []; //To store the conversation history with user
  wholeConversation: any[] = []; //To store the whole conversation
  receiverName: string = '';
  receiverId: string = '';
  time = new Date();
  senderId: string = '';
  sort = 'asc';
  count = 20;

  searchQuery: string = '';
  // Define a property to store the search results
  searchResults: any[] = [];

  editingMessageId: number | null = null; // Store the ID of the message being edited
  editedMessageContent = ''; // Store the edited message content

  showUserList: boolean = true; // Variable to control whether to show user list or search results

  loggedinUserId: string = '';

  showCreateGroupPopup = false;
  selectedUserIds: string[] = [];
  groupName: string = '';
  groupList: any[] = []; // Property to store the list of created groups

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router,
    private chatService: ChatService,
    private groupService: GroupService,
    @Inject(WINDOW) private window: Window
  ) {}

  ngOnInit(): void {
    const user = localStorage.getItem('user');
    if (user) {
      const jsonObject = JSON.parse(user);
      this.loggedinUserId = jsonObject.profile.id;
      console.log('LoggedInUserId : ', this.loggedinUserId);
    }

    this.fetchUserList();
    this.sendMessageForm = this.fb.group({
      messageText: ['', [Validators.required]],
    });

    this.fetchGroupList(); 
    this.createGroupForm = this.fb.group({
      groupName: ['', Validators.required],
      // memberIds: this.fb.array([]), // Initialize as an empty array
    });
  }

  // Function to toggle between user list and search results
  toggleUserList() {
    this.showUserList = !this.showUserList;
  }

  startChat(user: any) {
    debugger;
    // Set the selected user when a user is clicked
    this.selectedUser = user;
    this.wholeConversation = [];
    this.conversationHistory = [];
    console.log(this.selectedUser);

    if (this.chatService.isConnectionDisconnected()) {
      this.chatService.startConnection();
    }
    console.log(this.conversationHistory);
    this.chatService.hubConnection.on('ReceiveMessage', (message: any) => {
      this.conversationHistory.push(message);
      this.wholeConversation = this.conversationHistory;
    });

    this.fetchConversationHistory();
  }

  // Method to handle incoming edited messages from SignalR
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

  // Method to fetch the list of created groups
  fetchGroupList() {
    const token = this.authService.getToken(); // Get the JWT token from AuthService

    if (token) {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });

      // Replace 'groupList' and 'getGroupList' with your actual API endpoint for fetching group list
      this.groupService.getGroupList(headers).subscribe(
        (response : any) => {
          console.log('Group list fetch successful:', response);
          this.toastr.success('Group list fetch successful!', 'Success');
          this.groupList = response;
          console.log(this.groupList);
        },
        (error) => {
          this.toastr.error('Group list fetch failed!', 'Error');
          console.log('Group list fetch failed:', error);
        }
      );
    }
  }

  searchMessages() {
    if (this.searchQuery.trim() === '') {
      this.searchResults = [];
      return;
    }

    this.chatService.searchHistory(this.searchQuery, this.receiverId).subscribe(
      (response) => {
        this.searchResults = response.messages;
        console.log('searchResults : ', this.searchResults);
        this.toastr.success('Search query successfully executed!!!', 'success');

        this.showUserList = false; // Display search results when search is successful
      },
      (error) => {
        this.toastr.error('Search query failed!!!', 'error');
        console.error('Error searching messages:', error);
      }
    );
  }

  fetchConversationHistory() {
    debugger;

    if (this.selectedUser) {
      // Check if a user is selected
      this.receiverName = this.selectedUser.firstName;
      const user = localStorage.getItem('user');
      if (user) {
        const jsonObject = JSON.parse(user);
        this.senderId = jsonObject.profile.id;
      }

      this.receiverId = this.selectedUser.id;
      this.getConversation();
    }
  }

  private getConversation() {
    // Use your chat service to fetch conversation history
    this.chatService
      .getConversationHistory(
        this.senderId,
        this.receiverId,
        this.sort,
        this.time,
        this.count
      )
      .subscribe(
        (response) => {
          this.conversationHistory = response.messages.reverse();
          console.log(this.conversationHistory);

          // Prepend conversationHistory to wholeConversation
          this.wholeConversation.unshift(...this.conversationHistory);

          this.time = new Date(response.messages[0].timestamp);
          console.log('function time ', this.time);

          console.log('fetched', this.conversationHistory);

          this.toastr.success('Conversation history retrieved!', 'Success');

          console.log('Conversation history:', response);
        },
        (error) => {
          console.log('Error fetching conversation history:', error);
        }
      );
  }

  @HostListener('scroll', ['$event'])
  onScroll(event: Event) {
    console.log('Scroll event detected');
    const element = event.target as HTMLElement;
    if (element.scrollTop === 0) {
      this.fetchConversationHistory();
    }
  }

  onSubmit() {
    console.log(this.sendMessageForm.value);
    console.log(this.receiverId);
    if (this.sendMessageForm.valid) {
      const msg = this.sendMessageForm.value;

      // Get the JWT token from AuthService
      const token = this.authService.getToken();

      if (token) {
        // Create headers with the Authorization header containing the JWT token
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        });

        this.chatService
          .sendMessageToUser(msg, this.receiverId, headers)
          .subscribe(
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

  // Function to show the popup
  openCreateGroupPopup() {
    this.showCreateGroupPopup = true;
  }

  // Function to hide the popup
  closeCreateGroupPopup() {
    this.showCreateGroupPopup = false;
  }

  toggleUserSelection(userId: string) {
    if (this.selectedUserIds.includes(userId)) {
      // If the user ID is in the array, remove it
      this.selectedUserIds = this.selectedUserIds.filter((id) => id !== userId);
    } else {
      // If the user ID is not in the array, add it
      this.selectedUserIds.push(userId);
    }
  }

  createGroup() {
    // Validate the group name and selected users before creating a group
    const formData = this.createGroupForm.value;
  
    // Access groupName from the form
    const groupNameControl = this.createGroupForm.get('groupName');
    if (groupNameControl) {
      const groupName = groupNameControl.value;
  
      // Log the values for debugging
      console.log('groupName:', groupName);
      console.log('loggedinUserId:', this.loggedinUserId);
      console.log('selectedUserIds:', this.selectedUserIds);
  
      // Send formData to your API
      console.log(formData);
  
      if (this.createGroupForm.valid) {
        // Check if this.groupName is not null or empty
        if (!groupName) {
          this.toastr.error('Group name is required.', 'Error');
          return;
        }
  
        if (this.selectedUserIds.length === 0) {
          this.toastr.error('At least one user must be selected for the group.', 'Error');
          return;
        }
  
        // Prepare the data for creating the group
        const groupData = {
          Name: groupName,
          CreatorUserId: this.loggedinUserId,
          SelectedUserIds: this.selectedUserIds,
        };
  
        // Make an API call to create the group
        this.groupService.createGroup(groupData).subscribe(
          (response) => {
            // Handle the API response, e.g., show a success message.
            this.toastr.success(`${response.name} Group created successfully!`, 'Success');
            this.fetchGroupList();
            // Close the "Create Group" popup
            this.closeCreateGroupPopup();
            // Reset the group name field, selectedUserIds, and checkboxes
            this.createGroupForm.reset();
            this.selectedUserIds = [];
          },
          (error) => {
            console.log('API error:', error);
  
            // Handle errors, e.g., display an error message.
            this.toastr.error('Error while creating the group.', 'Error');
          }
        );
      }
    }
  }
  
}
