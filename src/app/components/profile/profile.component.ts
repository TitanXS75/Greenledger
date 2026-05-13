import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../services/auth.service';
import { Auth } from '@angular/fire/auth';

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
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private auth = inject(Auth);

  profileForm: FormGroup;
  loading = false;
  loadingProfile = true;
  message: string | null = null;
  error: string | null = null;
  userId: string | null = null;
  userInitial = '';

  constructor() {
    this.profileForm = this.fb.group({
      displayName: ['', Validators.required],
      email: [{ value: '', disabled: true }],
      contact: [''],
      age: [null]
    });
  }

  ngOnInit() {
    // Use onAuthStateChanged one-shot — works across all Firebase versions
    const unsub = this.auth.onAuthStateChanged(async user => {
      unsub();
      if (user) {
        this.userId = user.uid;
        try {
          const userData = await this.authService.getUserData(user.uid);
          if (userData) {
            this.profileForm.patchValue({
              displayName: userData.displayName || user.displayName || '',
              email: userData.email || user.email || '',
              contact: (userData as any).contact || '',
              age: (userData as any).age || null
            });
            this.userInitial = (userData.displayName || user.displayName || user.email || 'U').charAt(0).toUpperCase();
          } else {
            this.profileForm.patchValue({
              displayName: user.displayName || '',
              email: user.email || ''
            });
            this.userInitial = (user.displayName || user.email || 'U').charAt(0).toUpperCase();
          }
        } catch (e) {
          console.error('Error loading profile from Firestore:', e);
          // Fallback if Firestore rules block read
          this.profileForm.patchValue({
            displayName: user.displayName || '',
            email: user.email || ''
          });
          this.userInitial = (user.displayName || user.email || 'U').charAt(0).toUpperCase();
        }
      }
      this.loadingProfile = false;
    });
  }

  async onSubmit() {
    if (this.profileForm.invalid || !this.userId) return;

    this.loading = true;
    this.message = null;
    this.error = null;

    try {
      await this.authService.updateProfile(this.userId, this.profileForm.getRawValue());
      this.message = 'Profile updated successfully!';
      // Update the initial shown in avatar
      const name = this.profileForm.get('displayName')?.value;
      if (name) this.userInitial = name.charAt(0).toUpperCase();
    } catch (err: any) {
      this.error = err.message || 'Failed to update profile';
    } finally {
      this.loading = false;
    }
  }
}
