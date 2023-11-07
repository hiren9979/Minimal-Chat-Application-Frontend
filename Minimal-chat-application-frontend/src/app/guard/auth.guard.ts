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

    const user = localStorage.getItem('user');
    if (user) {
      const jsonObject = JSON.parse(user);
      if(jsonObject.token===null) {
        this.toastr.error("Authorization failed - Token null", 'error');
        this.toastr.error('Please login first','Error');
      this.router.navigate(['/login']);
      return false;
      }
    }
    return true;
  }
}
