import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { UserService } from '../services/user-service';
import { AuthService } from '../services/auth-service';
import { getApiErrorMessage } from '../utils/api-error.util';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit {
  registerForm!: FormGroup;
  //firstName = '';
  //lastName = '';
  //email = '';
  //username = '';
  //password = '';
  //confirmPassword = '';
  errorMessage = '';

  private readonly minPasswordLength = 8;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/task/list']);
    }

    this.registerForm = new FormGroup({
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
      confirmPassword: new FormControl('', [Validators.required]),
    });
  }

  submit(): void {
    this.errorMessage = '';

    const { firstName, lastName, email, username, password, confirmPassword } =
      this.registerForm.value;

    if (password.length < this.minPasswordLength) {
      this.errorMessage = `Password must be at least ${this.minPasswordLength} characters.`;
      return;
    }
    if (password !== confirmPassword) {
      this.errorMessage = 'Password and Confirm password do not match.';
      return;
    }

    this.userService.register(firstName, lastName, email, username, password).subscribe({
      next: (response) => {
        if (response.statusCode === 200) {
          this.router.navigate(['/login']);
        } else {
          this.errorMessage = response.message;
        }
      },
      error: (err) => {
        this.errorMessage = getApiErrorMessage(err);
      },
    });
  }
}
