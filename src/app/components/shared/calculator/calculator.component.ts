import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-calculator',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatDialogModule],
  template: `
    <div class="calculator-container">
      <div class="calc-header">
        <mat-icon>calculate</mat-icon>
        <span>Quick Calculator</span>
      </div>
      
      <div class="display">
        <div class="previous">{{ prevOperand }} {{ operation }}</div>
        <div class="current">{{ currentOperand || '0' }}</div>
      </div>
      
      <div class="buttons-grid">
        <button class="btn-tool" (click)="clear()">AC</button>
        <button class="btn-tool" (click)="delete()">DEL</button>
        <button class="btn-op" (click)="chooseOperation('÷')">÷</button>
        <button class="btn-op" (click)="chooseOperation('*')">×</button>
        
        <button class="btn-num" (click)="appendNumber('7')">7</button>
        <button class="btn-num" (click)="appendNumber('8')">8</button>
        <button class="btn-num" (click)="appendNumber('9')">9</button>
        <button class="btn-op" (click)="chooseOperation('-')">-</button>
        
        <button class="btn-num" (click)="appendNumber('4')">4</button>
        <button class="btn-num" (click)="appendNumber('5')">5</button>
        <button class="btn-num" (click)="appendNumber('6')">6</button>
        <button class="btn-op" (click)="chooseOperation('+')">+</button>
        
        <button class="btn-num" (click)="appendNumber('1')">1</button>
        <button class="btn-num" (click)="appendNumber('2')">2</button>
        <button class="btn-num" (click)="appendNumber('3')">3</button>
        <button class="btn-equal" (click)="compute()">=</button>
        
        <button class="btn-num span-two" (click)="appendNumber('0')">0</button>
        <button class="btn-num" (click)="appendNumber('.')">.</button>
      </div>
    </div>
  `,
  styles: [`
    .calculator-container {
      width: 320px;
      background-color: #0f172a;
      border-radius: 24px;
      padding: 20px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      color: white;
      user-select: none;
    }

    .calc-header {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #94a3b8;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 16px;
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }

    .display {
      background-color: #1e293b;
      padding: 24px 16px;
      border-radius: 16px;
      margin-bottom: 24px;
      text-align: right;
      min-height: 100px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      border: 1px solid #334155;
    }

    .previous {
      color: #64748b;
      font-size: 14px;
      min-height: 20px;
      font-family: 'Roboto Mono', monospace;
    }

    .current {
      font-size: 36px;
      font-weight: 600;
      color: #f8fafc;
      overflow: hidden;
      text-overflow: ellipsis;
      font-family: 'Roboto Mono', monospace;
    }

    .buttons-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }

    button {
      height: 56px;
      border: none;
      border-radius: 16px;
      font-size: 18px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      justify-content: center;
      
      &:active {
        transform: scale(0.92);
      }
    }

    .btn-num {
      background-color: #334155;
      color: #f8fafc;
      &:hover { background-color: #475569; }
    }

    .btn-op {
      background-color: #1e3c72;
      color: #38bdf8;
      font-size: 22px;
      &:hover { background-color: #2563eb; color: white; }
    }

    .btn-tool {
      background-color: #1e293b;
      color: #94a3b8;
      font-size: 14px;
      &:hover { background-color: #334155; color: #f8fafc; }
    }

    .btn-equal {
      grid-row: span 2;
      height: auto;
      background: linear-gradient(135deg, #2563eb 0%, #1e3c72 100%);
      color: white;
      font-size: 24px;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
      &:hover {
        box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
        filter: brightness(1.1);
      }
    }

    .span-two {
      grid-column: span 2;
    }
  `]
})
export class CalculatorComponent {
  currentOperand = '';
  prevOperand = '';
  operation: string | undefined;

  clear() {
    this.currentOperand = '';
    this.prevOperand = '';
    this.operation = undefined;
  }

  delete() {
    this.currentOperand = this.currentOperand.toString().slice(0, -1);
  }

  appendNumber(number: string) {
    if (number === '.' && this.currentOperand.includes('.')) return;
    if (this.currentOperand.length > 10) return;
    this.currentOperand = this.currentOperand.toString() + number.toString();
  }

  chooseOperation(operation: string) {
    if (this.currentOperand === '') return;
    if (this.prevOperand !== '') {
      this.compute();
    }
    this.operation = operation;
    this.prevOperand = this.currentOperand;
    this.currentOperand = '';
  }

  compute() {
    let computation;
    const prev = parseFloat(this.prevOperand);
    const current = parseFloat(this.currentOperand);
    if (isNaN(prev) || isNaN(current)) return;
    switch (this.operation) {
      case '+': computation = prev + current; break;
      case '-': computation = prev - current; break;
      case '*': computation = prev * current; break;
      case '÷': computation = prev / current; break;
      default: return;
    }
    // Round to 2 decimal places to keep it clean
    this.currentOperand = (Math.round(computation * 100) / 100).toString();
    this.operation = undefined;
    this.prevOperand = '';
  }
}
