import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user-service';
import { AuthService } from '../services/auth-service';
import { getApiErrorMessage } from '../utils/api-error.util';
import type { User, LoginResponse } from '../model/user';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  email!: string;
  password!: string;
  user: User | null = null;
  errorMessage = '';

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

  login(): void {
    this.errorMessage = '';
    this.user = null;

    this.userService.login(this.email, this.password).subscribe({
      next: (response) => {
        if (response.statusCode === 200 && response.result) {
          this.authService.setUser(response.result);
          this.user = response.result;
          this.router.navigate(['/task/list']);
        } else {
          this.errorMessage = response.message || 'Login failed';
        }
      },
      error: (err) => {
        this.errorMessage = getApiErrorMessage(err, 'There was an error. Please try again.');
      },
    });
  }
}
