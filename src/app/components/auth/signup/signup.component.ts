import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule, 
    MatCardModule, 
    MatIconModule, 
    MatProgressSpinnerModule,
    RouterModule
  ],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  signupForm: FormGroup;
  loading = false;
  error: string | null = null;
  hidePassword = true;

  constructor() {
    this.signupForm = this.fb.group({
      displayName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get displayName() { return this.signupForm.get('displayName'); }
  get email() { return this.signupForm.get('email'); }
  get password() { return this.signupForm.get('password'); }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  async onSubmit() {
    if (this.signupForm.invalid) return;
    this.loading = true;
    this.error = null;
    try {
      const { email, password, displayName } = this.signupForm.value;
      await this.authService.signup(email, password, displayName);
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.error = this.getErrorMessage(err);
    } finally {
      this.loading = false;
    }
  }

  async onGoogleLogin() {
    this.loading = true;
    this.error = null;
    try {
      await this.authService.googleLogin();
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.error = this.getErrorMessage(err);
    } finally {
      this.loading = false;
    }
  }

  private getErrorMessage(err: any): string {
    if (err.code === 'auth/email-already-in-use') {
      return 'This email is already in use';
    }
    return err.message || 'An error occurred during signup';
  }
}
