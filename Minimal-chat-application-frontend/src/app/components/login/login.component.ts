import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth.service';
import { ToastrService } from 'ngx-toastr';
import { CredentialResponse, PromptMomentNotification } from 'google-one-tap';
import { environment } from 'src/app/shared/env';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private _ngZone: NgZone
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    // @ts-ignore
    window.onGoogleLibraryLoad = () => {
      // @ts-ignore
      google.accounts.id.initialize({
        client_id: environment.clientId,
        callback: this.handleCredentialResponse.bind(this),
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      // @ts-ignore
      google.accounts.id.renderButton(
        // @ts-ignore
        document.getElementById('buttonDiv'),
        { theme: 'outline', size: 'large', width: '100%' }
      );
      // @ts-ignore
      google.accounts.id.prompt((notification: PromptMomentNotification) => {});
    };
  }

  /**
   * Handles the response received after a Google Sign-In attempt.
   *
   * @param response - The response object containing credential information.
   */
  private handleCredentialResponse(response: CredentialResponse) {
    debugger;
    console.log(response);
    this.authService
      .loginWithGoogle(response.credential.toString())
      .subscribe((x: any) => {
        debugger;
        this._ngZone.run(() => {
          if (!x) {
            // If x is empty, consider it an error
            this.toastr.error('Login Failed!', 'Error');
          } else {
            console.log(x);

            // Convert the user object to a JSON string before storing it
            const userJson = JSON.stringify(x);
            localStorage.setItem('user', userJson);

            // Assuming x contains the token
            this.toastr.success('Login successful!', 'Success');
            this.router.navigateByUrl('/chat');
          }
        });
      });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const user = this.loginForm.value;
      this.authService.login(user).subscribe(
        (response) => {
          if (response.succeeded) {
            // Authentication was successful
            console.log('Login successful:', response);

            // Store user data in local storage (you may want to secure this in a real application)
            localStorage.setItem('user', JSON.stringify(response));

            // Display a success message and navigate to the chat page
            this.toastr.success('Login successful!', 'Success');
            this.router.navigate(['/chat']);
          } else {
            // Handle specific error scenarios
            if (response.error === 'User not found') {
              this.toastr.error(
                'User not found. Please check your email.',
                'Error'
              );
            } else if (response.error === 'Invalid credentials') {
              this.toastr.error(
                'Invalid credentials. Please try again.',
                'Error'
              );
            } else {
              // Handle other errors
              this.toastr.error(
                'An error occurred. Please try again later.',
                'Error'
              );
            }
          }
        },
        (error) => {
          this.toastr.error('Login failed!', 'Error');
          console.log('Login failed:', error);
        }
      );
    }
  }
}
