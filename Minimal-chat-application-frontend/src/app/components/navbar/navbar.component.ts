import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {


    constructor(
      private router : Router,
      private toastr : ToastrService,
    ){}
    logout(){
      localStorage.removeItem('user');
      this.toastr.success('Logout successfull !!!','Success');
      this.router.navigate(['/login']);
    }

    // Check if the user is logged in based on the presence of user data in local storage
  isLoggedIn(): boolean {
    return !!localStorage.getItem('user');
  }

  // Retrieve user data from local storage
  getUser(): any {
    const userString = localStorage.getItem('user');
    if (userString) {
      return JSON.parse(userString);
    }
    return null;
  }

}