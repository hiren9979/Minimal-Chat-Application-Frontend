import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  signupForm!: FormGroup;
    constructor(
      private fb: FormBuilder,
      private authService : AuthService,
      private router:Router,
      private toastr : ToastrService,
    ){}
    ngOnInit(): void {
      this.signupForm = this.fb.group({
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]], // Array of validators
        password: ['', [Validators.required, Validators.minLength(6)]] // Array of validators
      });
      
    }

    onSubmit() {
      if (this.signupForm.valid) {
          const user = this.signupForm.value;
  
          this.authService.signup(user).subscribe(
              (response) => {
                  console.log('Signup successful:', response);
                  this.toastr.success('SignUp successful!', 'Success');
                  this.router.navigate(['/login']);
              },
              (error) => {
                  this.toastr.error('Signup failed!', 'Error');
                  console.log('Signup failed:', error);
              }
          );
      }
  }

}
