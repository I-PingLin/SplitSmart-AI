
import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PersonSummary } from '../models/bill.model';

@Component({
  selector: 'app-bill-summary',
  imports: [CommonModule],
  template: `
    <div class="space-y-4">
      <h3 class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Final Breakdown</h3>
      
      @if (summaries().length === 0) {
        <p class="text-xs text-slate-400 italic">No assignments yet</p>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          @for (person of summaries(); track person.name) {
            <div class="bg-white p-3 rounded-lg shadow-sm border border-slate-200 flex flex-col">
              <div class="flex justify-between items-center mb-2">
                <span class="font-bold text-slate-800 text-sm">{{ person.name }}</span>
                <span class="font-black text-indigo-600">\${{ person.total.toFixed(2) }}</span>
              </div>
              <div class="text-[10px] space-y-0.5 text-slate-500">
                <div class="flex justify-between">
                  <span>Subtotal:</span>
                  <span>\${{ person.subtotal.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Tax:</span>
                  <span>\${{ person.taxShare.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Tip:</span>
                  <span>\${{ person.tipShare.toFixed(2) }}</span>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class BillSummaryComponent {
  summaries = input.required<PersonSummary[]>();
}
