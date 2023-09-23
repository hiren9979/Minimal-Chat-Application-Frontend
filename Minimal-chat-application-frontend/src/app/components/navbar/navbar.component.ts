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
}