import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user-service';
import { AuthService } from '../services/auth-service';
import { getApiErrorMessage } from '../utils/api-error.util';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit {
  firstName = '';
  lastName = '';
  email = '';
  username = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';

  private readonly minPasswordLength = 8;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/task/list']);
    }
  }

  submit(): void {
    this.errorMessage = '';

    if (this.password.length < this.minPasswordLength) {
      this.errorMessage = `Password must be at least ${this.minPasswordLength} characters.`;
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Password and Confirm password do not match.';
      return;
    }

    this.userService
      .register(
        this.firstName,
        this.lastName,
        this.email,
        this.username,
        this.password
      )
      .subscribe({
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
