import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';
import { AppUser } from '../../models/user.model';
import { CalculatorComponent } from '../shared/calculator/calculator.component';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDialogModule
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  private breakpointObserver = inject(BreakpointObserver);
  private authService = inject(AuthService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  currentUser: AppUser | null = null;
  isSidenavOpen = true;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  ngOnInit(): void {
    this.authService.user$.subscribe(async user => {
      if (user) {
        const userData = await this.authService.getUserData(user.uid);
        if (userData) {
          this.currentUser = userData;
        } else {
          this.currentUser = { uid: user.uid, email: user.email || '', role: 'member', displayName: user.displayName || 'User' };
        }
      } else {
        this.currentUser = null;
      }
    });

    this.isHandset$.subscribe(isHandset => {
      this.isSidenavOpen = !isHandset;
    });
  }

  closeOnMobile(): void {
    this.isHandset$.subscribe(isHandset => {
      if (isHandset) {
        this.isSidenavOpen = false;
      }
    }).unsubscribe();
  }

  async logout(): Promise<void> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Logout Confirmation',
        message: 'Are you sure you want to log out of GreenLedger?'
      }
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        await this.authService.logout();
      }
    });
  }

  toggleSidenav(): void {
    this.isSidenavOpen = !this.isSidenavOpen;
  }

  openCalculator(): void {
    this.dialog.open(CalculatorComponent, {
      width: '320px',
      panelClass: 'calculator-dialog'
    });
  }
}
