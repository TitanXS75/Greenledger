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
        <span>QUICK CALCULATOR</span>
      </div>
      
      <div class="display">
        <div class="previous">{{ prevOperand }} {{ operation }}</div>
        <div class="current">{{ currentOperand || '0' }}</div>
      </div>
      
      <div class="buttons-grid">
        <button class="btn-calc btn-tool" (click)="clear()">AC</button>
        <button class="btn-calc btn-tool" (click)="delete()">DEL</button>
        <button class="btn-calc btn-op" (click)="chooseOperation('÷')">÷</button>
        <button class="btn-calc btn-op" (click)="chooseOperation('*')">×</button>
        
        <button class="btn-calc btn-num" (click)="appendNumber('7')">7</button>
        <button class="btn-calc btn-num" (click)="appendNumber('8')">8</button>
        <button class="btn-calc btn-num" (click)="appendNumber('9')">9</button>
        <button class="btn-calc btn-op" (click)="chooseOperation('-')">-</button>
        
        <button class="btn-calc btn-num" (click)="appendNumber('4')">4</button>
        <button class="btn-calc btn-num" (click)="appendNumber('5')">5</button>
        <button class="btn-calc btn-num" (click)="appendNumber('6')">6</button>
        <button class="btn-calc btn-op" (click)="chooseOperation('+')">+</button>
        
        <button class="btn-calc btn-num" (click)="appendNumber('1')">1</button>
        <button class="btn-calc btn-num" (click)="appendNumber('2')">2</button>
        <button class="btn-calc btn-num" (click)="appendNumber('3')">3</button>
        <button class="btn-calc btn-equal" (click)="compute()">=</button>
        
        <button class="btn-calc btn-num span-two" (click)="appendNumber('0')">0</button>
        <button class="btn-calc btn-num" (click)="appendNumber('.')">.</button>
      </div>
    </div>
  `,
  styles: [`
    .calculator-container {
      width: 100%;
      background-color: #1e3c72; /* Site Primary Dark Blue */
      border-radius: 16px;
      padding: 24px;
      color: white;
      user-select: none;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
    }

    .calc-header {
      display: flex;
      align-items: center;
      gap: 10px;
      color: rgba(255, 255, 255, 0.7);
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 20px;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }

    .display {
      background-color: rgba(0, 0, 0, 0.2);
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 24px;
      text-align: right;
      min-height: 100px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .previous {
      color: rgba(255, 255, 255, 0.5);
      font-size: 14px;
      min-height: 20px;
      font-family: 'Roboto Mono', monospace;
    }

    .current {
      font-size: 36px;
      font-weight: 600;
      color: white;
      overflow: hidden;
      text-overflow: ellipsis;
      font-family: 'Roboto Mono', monospace;
    }

    .buttons-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }

    .btn-calc {
      height: 56px;
      border: none;
      border-radius: 12px;
      font-size: 18px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.1);
      color: white;
      
      &:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);
      }

      &:active {
        transform: translateY(0);
      }
    }

    .btn-num {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .btn-op {
      background-color: #2a5298; /* Lighter Blue from theme */
      color: #38bdf8; /* Highlight Blue */
    }

    .btn-tool {
      background-color: rgba(255, 255, 255, 0.05);
      color: #cbd5e1;
    }

    .btn-equal {
      grid-row: span 2;
      height: auto;
      background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); /* Green Theme */
      color: white;
      box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
      &:hover {
        box-shadow: 0 6px 16px rgba(34, 197, 94, 0.4);
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
    this.currentOperand = (Math.round(computation * 100) / 100).toString();
    this.operation = undefined;
    this.prevOperand = '';
  }
}
