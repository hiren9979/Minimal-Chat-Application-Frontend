import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Toast, ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private toastr : ToastrService,
    ) {}

  canActivate(): boolean {
    // Check if a valid token is present in local storage
    const token = localStorage.getItem('user');
    console.log(token);
    if (token) {
      return true;
    } else {
      // Token is not present, redirect to the login page
      this.toastr.error('Please login first','Error');
      this.router.navigate(['/login']);
      return false;
    }
  }
}
