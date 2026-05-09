import { Component, Input, ContentChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-responsive-table',
  standalone: true,
  imports: [CommonModule, MatTableModule],
  template: `
    <div class="table-container">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .table-container {
      overflow-x: auto;
      width: 100%;
    }
  `]
})
export class ResponsiveTableComponent {}
