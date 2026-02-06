
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReceiptItem } from '../models/bill.model';

@Component({
  selector: 'app-receipt-display',
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-lg font-semibold text-slate-800">Receipt Items</h2>
        <label class="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition flex items-center gap-2">
          <span class="material-icons text-sm">upload_file</span>
          Upload Image
          <input type="file" (change)="onFileSelected($event)" class="hidden" accept="image/*">
        </label>
      </div>

      @if (items().length === 0) {
        <div class="flex flex-col items-center justify-center py-20 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
          <span class="material-icons text-5xl mb-4">no_photography</span>
          <p>No receipt uploaded yet</p>
        </div>
      } @else {
        <div class="space-y-3">
          @for (item of items(); track item.id) {
            <div class="p-4 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-indigo-300 transition group">
              <div class="flex justify-between items-start mb-2">
                <span class="font-medium text-slate-800">{{ item.name }}</span>
                <span class="font-bold text-slate-900">\${{ item.price.toFixed(2) }}</span>
              </div>
              <div class="flex flex-wrap gap-1">
                @if (item.assignedTo.length === 0) {
                  <span class="text-xs text-slate-400 italic">Not assigned</span>
                } @else {
                  @for (person of item.assignedTo; track person) {
                    <span class="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">
                      {{ person }}
                    </span>
                  }
                }
              </div>
            </div>
          }

          <div class="mt-6 pt-4 border-t border-slate-100">
            <div class="flex justify-between text-slate-600 mb-1">
              <span>Subtotal</span>
              <span>\${{ subtotal().toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-slate-600 mb-1">
              <span>Tax</span>
              <span>\${{ tax().toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-slate-600 mb-1">
              <span>Tip</span>
              <span>\${{ tip().toFixed(2) }}</span>
            </div>
            <div class="flex justify-between font-bold text-lg text-slate-900 pt-2 border-t border-slate-200 mt-2">
              <span>Grand Total</span>
              <span>\${{ total().toFixed(2) }}</span>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class ReceiptDisplayComponent {
  items = input.required<ReceiptItem[]>();
  tax = input.required<number>();
  tip = input.required<number>();
  upload = output<File>();

  subtotal = () => this.items().reduce((s, i) => s + i.price, 0);
  total = () => this.subtotal() + this.tax() + this.tip();

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.upload.emit(file);
    }
  }
}
