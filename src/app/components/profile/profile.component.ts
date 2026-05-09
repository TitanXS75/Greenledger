import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  profileForm: FormGroup;
  loading = false;
  message: string | null = null;
  error: string | null = null;
  userId: string | null = null;

  constructor() {
    this.profileForm = this.fb.group({
      displayName: ['', Validators.required],
      email: [{ value: '', disabled: true }],
      contact: [''],
      age: [null]
    });
  }

  async ngOnInit() {
    const user = await firstValueFrom(this.authService.user$);
    if (user) {
      this.userId = user.uid;
      const userData = await this.authService.getUserData(user.uid);
      if (userData) {
        this.profileForm.patchValue({
          displayName: userData.displayName || '',
          email: userData.email,
          contact: userData.contact || '',
          age: userData.age || null
        });
      }
    }
  }

  async onSubmit() {
    if (this.profileForm.invalid || !this.userId) return;

    this.loading = true;
    this.message = null;
    this.error = null;

    try {
      await this.authService.updateProfile(this.userId, this.profileForm.getRawValue());
      this.message = 'Profile updated successfully!';
    } catch (err: any) {
      this.error = err.message || 'Failed to update profile';
    } finally {
      this.loading = false;
    }
  }
}
