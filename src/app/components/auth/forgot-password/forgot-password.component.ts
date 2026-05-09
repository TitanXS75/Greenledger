import { Component, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
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
  selector: 'app-forgot-password',
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
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private location = inject(Location);

  forgotForm: FormGroup;
  loading = false;
  success = false;
  error: string | null = null;

  constructor() {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get email() { return this.forgotForm.get('email'); }

  goBack() {
    this.location.back();
  }

  async onSubmit() {
    if (this.forgotForm.invalid) return;
    this.loading = true;
    this.error = null;
    try {
      const { email } = this.forgotForm.value;
      await this.authService.resetPassword(email);
      this.success = true;
    } catch (err: any) {
      this.error = this.getErrorMessage(err);
    } finally {
      this.loading = false;
    }
  }

  private getErrorMessage(err: any): string {
    if (err.code === 'auth/user-not-found') {
      return 'No user found with this email address';
    }
    return err.message || 'An error occurred. Please try again.';
  }
}
