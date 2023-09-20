import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { AuthService } from 'src/app/service/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

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
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchUserList();
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
}
