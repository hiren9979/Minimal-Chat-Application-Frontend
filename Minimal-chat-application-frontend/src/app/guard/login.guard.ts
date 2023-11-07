import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root' // Provide the guard at the root level
})
export class LoginGuard implements CanActivate {
  constructor(
    private router: Router,
    private toastr: ToastrService
  ) {}

  canActivate(): boolean {
    // Your logic for checking if the user is logged in
    // ...

    // Example logic:
    const user = localStorage.getItem('user');
    if (user) {
      const jsonObject = JSON.parse(user);
      if (jsonObject.token === null) {
        this.toastr.error("Authorization failed - Token null", 'error');
        this.toastr.error('Please login first', 'Error');
        this.router.navigate(['/login']);
        return false;
      } else {
        this.toastr.warning('User is already logged in !!!', 'Warning');
        return false;
      }
    }
    return true;
  }
}
