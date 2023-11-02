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
import { RealTimeMessageService } from 'src/app/service/real-time-message.service';

/* Create a new injection token for injecting the window into a component. */
export const WINDOW = new InjectionToken('WindowToken');

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit {
  @ViewChild('chatContainer', { static: false }) chatContainer!: ElementRef;
  @ViewChild('forScrolling') forScrolling!: ElementRef;

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

  selectedGroup: any = null;

  isUserSelected: boolean = true;
  isGroup: boolean = false;

  groupMemberUsernames: any[] = [];
  gropuAdminId: string = '';
  tagUser: boolean = false;
  msg: string = '';
  tagUserList: any[] = [];
  isUserTagged: boolean = false;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router,
    private chatService: ChatService,
    private sharedService: RealTimeMessageService,
    private groupService: GroupService,
    @Inject(WINDOW) private window: Window
  ) {}

  ngOnInit(): void {
    const user = localStorage.getItem('user');
    if (user) {
      const jsonObject = JSON.parse(user);
      this.loggedinUserId = jsonObject.profile.id;
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

  taggingUser(user: any) {
    const userName = user.userName;
    if (!this.tagUserList.includes('@' + userName)) {
      // Push the name to the tagUserList
      this.tagUserList.push('@' + userName);
    } else {
      this.toastr.error('User already tagged', 'Error');
    }

    // Create a unique list of user names
    const uniqueUserList = [...new Set(this.tagUserList)];

    // Join the unique list with spaces
    const taggedUsers = uniqueUserList.join(' ');
    console.log('tagged Users', taggedUsers);

    // Set the input field value to the concatenated, unique list
    this.sendMessageForm.controls['messageText'].setValue(taggedUsers);
    this.isUserTagged = true;

    console.log('taggedUserList : ', uniqueUserList);
    console.log('tagging userName: ', taggedUsers);
  }

  onMessageInput(message: any) {
    if (message) {
      console.log(message.data);

      if (this.tagUserList.length === 0) this.isUserTagged = false;

      console.log('isUserTagged', this.isUserTagged);

      console.log('hitting...');
      if (message.data === '@') {
        this.tagUser = true;
        if (this.groupMemberUsernames.length == 0) this.fetchGroupMembers();
      } else {
        this.tagUser = false;
      }
    }
  }

  fetchGroupMembers() {
    const groupId = this.receiverId;
    this.groupService.fetchGroupMembers(groupId).subscribe(
      (response: any) => {
        // Handle the retrieved group members, e.g., display them in your UI.
        this.groupMemberUsernames = response;

        this.groupMemberUsernames = this.groupMemberUsernames.filter(
          (user) => user.userId !== this.senderId
        );

        const groupAdminMember = this.groupMemberUsernames.find(
          (member: any) => member.isAdmin === true
        );

        if (groupAdminMember) {
          this.gropuAdminId = groupAdminMember.userId;
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

  startChat(userOrGroup: any) {
    // Set the selected user when a user is clicked
    this.selectedUser = userOrGroup;
    if ('firstName' in userOrGroup) {
      this.receiverName = userOrGroup.firstName;
      this.isUserSelected = true;
      this.isGroup = false;
    } else if ('name' in userOrGroup) {
      this.isGroup = true;
      this.receiverName = userOrGroup.name;
      this.receiverId = userOrGroup.id;
      this.isUserSelected = false;
    } else {
      // Handle the case when the type of userOrGroup is unknown
      console.error('Unknown type of userOrGroup:', userOrGroup);
      return;
    }

    this.wholeConversation = [];
    this.conversationHistory = [];

    if (this.chatService.isConnectionDisconnected()) {
      this.chatService.startSignalRConnection();
    }
    this.chatService.hubConnection.on('ReceiveMessage', (message: any) => {
      this.conversationHistory.push(message);
      this.wholeConversation = this.conversationHistory;
    });

    this.fetchConversationHistory();
  }

  startGroupChat(group: any) {
    this.isUserSelected = false;
    this.selectedUser = null;
    this.selectedGroup = group;
    this.groupName = group.name;
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
          this.toastr.success('User list fetch successful!', 'Success');
          this.userList = response.users;
        },
        (error) => {
          this.toastr.error('User list fetch failed!', 'Error');
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
        (response: any) => {
          this.toastr.success('Group list fetch successful!', 'Success');
          this.groupList = response;
        },
        (error) => {
          this.toastr.error('Group list fetch failed!', 'Error');
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
    if (this.selectedUser) {
      const userOrGroup = this.selectedUser;
      if ('firstName' in userOrGroup) {
        this.receiverName = userOrGroup.firstName;
        this.isUserSelected = true;
      } else if ('name' in userOrGroup) {
        this.receiverName = userOrGroup.name;
        this.isUserSelected = false;
      }

      // Check if a user is selected
      const user = localStorage.getItem('user');
      if (user) {
        const jsonObject = JSON.parse(user);
        this.senderId = jsonObject.profile.id;
      }

      this.receiverId = this.selectedUser.id;
      console.log('conversatino history in fch', this.conversationHistory);
      this.getConversation();
      console.log(
        'conversatino history after getconversation',
        this.conversationHistory
      );
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
        this.count,
        this.isGroup
      )
      .subscribe(
        (response) => {
          this.conversationHistory = response.messages.reverse();

          // Prepend conversationHistory to wholeConversation
          this.wholeConversation.unshift(...this.conversationHistory);
          // this.time = new Date(response.messages[0].timestamp);
          this.time =
            this.conversationHistory.length > 0
              ? new Date(this.conversationHistory[0].timestamp)
              : new Date();
              setTimeout(() => {
                this.scrollToBottom();
              });
          // this.chatService.sendMessageSignalR(newMessage);
          this.toastr.success('Conversation history retrieved!', 'Success');
          console.log(
            'Conversation history in getConversation',
            this.conversationHistory
          );

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
    if (this.sendMessageForm.valid) {
      let msg = this.sendMessageForm.value;

      // Get the JWT token from AuthService
      const token = this.authService.getToken();

      if (token) {
        // Create headers with the Authorization header containing the JWT token
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        });

        if (!this.isGroup) {
          this.chatService
            .sendMessageToUser(msg, this.receiverId, headers)
            .subscribe(
              (response) => {
                this.chatService.sendMessageSignalR(msg);
                this.toastr.success('Message sent successful!', 'Success');
                this.time = new Date();
                this.wholeConversation = [];
                console.log(
                  'conversatino history in onsubmit',
                  this.conversationHistory
                );
                this.fetchConversationHistory();
                this.wholeConversation.push(response);
                this.sendMessageForm.reset();
              },
              (error) => {
                this.toastr.error('Message Sent failed!', 'Error');
              }
            );
        } else {
          console.log('message in group : ', msg);

          let i;
          for (i = 0; i < this.tagUserList.length; i++) {
            if (msg.messageText.includes(this.tagUserList[i])) {
              this.isUserTagged = true;
              const replacedMessage = '[[]]' + msg.messageText;
              msg.messageText = replacedMessage;

              console.log('after adding message : ', msg);
              break;
            }
          }

          if (i === this.tagUserList.length) {
            this.tagUserList = [];
          }

          this.groupService
            .sendMessageToGroupMembers(this.receiverId, msg)
            .subscribe(
              (response) => {
                this.toastr.success('Message Sent successfully!', 'Success');
                this.tagUserList = [];

                this.time = new Date();
                this.wholeConversation = [];
                this.fetchConversationHistory();

                console.log(
                  'conversation history after call fch',
                  this.conversationHistory
                );

                this.wholeConversation = this.conversationHistory;
                // this.wholeConversation.push(response.newMessage);
                // console.log("newMesage",response.newMessage);

                console.log('wholeconversation', this.wholeConversation);

                this.chatService.sendMessageSignalR(response.newMessage);

                this.conversationHistory = this.conversationHistory.filter(
                  (message, index, self) =>
                    self.findIndex((m) => m.id === message.id) === index
                );

                console.log(
                  'conversation history after filtering',
                  this.conversationHistory
                );
                this.sendMessageForm.reset();
              },
              (error) => {
                this.toastr.error('Message Sent failed!', 'Error');
              }
            );
        }
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

      // if (this.createGroupForm.valid)
      {
        // Check if this.groupName is not null or empty
        if (!groupName) {
          this.toastr.error('Group name is required.', 'Error');
          return;
        }

        if (this.selectedUserIds.length === 0) {
          this.toastr.error(
            'At least one user must be selected for the group.',
            'Error'
          );
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
            this.toastr.success(
              `${response.name} Group created successfully!`,
              'Success'
            );
            this.fetchGroupList();
            // Close the "Create Group" popup
            this.closeCreateGroupPopup();
            // Reset the group name field, selectedUserIds, and checkboxes
            this.createGroupForm.reset();
            this.selectedUserIds = [];
          },
          (error) => {
            // Handle errors, e.g., display an error message.
            this.toastr.error('Error while creating the group.', 'Error');
          }
        );
      }
    }
  }
  scrollToBottom() {
    const messageContainer = document.querySelector('.chat-messages');
    if (messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  }
  


}
