
import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatMessage } from '../models/bill.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-interface',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col h-full">
      <!-- Chat Messages -->
      <div class="flex-1 overflow-y-auto p-6 space-y-4">
        @for (msg of messages(); track msg.timestamp.getTime()) {
          <div [class]="msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'">
            <div 
              [class]="msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-none px-4 py-3 shadow-sm' 
                : 'bg-white text-slate-800 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-slate-200'"
              class="max-w-[80%] text-sm"
            >
              {{ msg.text }}
            </div>
          </div>
        }
        @if (isProcessing()) {
          <div class="flex justify-start">
            <div class="bg-white text-slate-400 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-slate-200 flex items-center gap-2">
              <div class="animate-bounce h-1.5 w-1.5 bg-slate-400 rounded-full"></div>
              <div class="animate-bounce h-1.5 w-1.5 bg-slate-400 rounded-full [animation-delay:0.2s]"></div>
              <div class="animate-bounce h-1.5 w-1.5 bg-slate-400 rounded-full [animation-delay:0.4s]"></div>
            </div>
          </div>
        }
      </div>

      <!-- Chat Input -->
      <div class="p-4 bg-white border-t border-slate-200">
        <form (submit)="$event.preventDefault(); onSend()" class="relative">
          <input 
            type="text" 
            [(ngModel)]="userInput" 
            name="chatInput"
            placeholder="e.g., 'Sarah and Sue shared the pizza'"
            class="w-full bg-slate-50 border border-slate-200 rounded-full py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          >
          <button 
            type="submit"
            [disabled]="!userInput.trim() || isProcessing()"
            class="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <span class="material-icons text-lg">send</span>
          </button>
        </form>
        <p class="text-[10px] text-slate-400 mt-2 text-center">
          Type commands like "Dhruv had the wings" or "All of us shared the fries"
        </p>
      </div>
    </div>
  `
})
export class ChatInterfaceComponent {
  messages = input.required<ChatMessage[]>();
  isProcessing = input.required<boolean>();
  sendMessage = output<string>();

  userInput = '';

  onSend() {
    if (this.userInput.trim() && !this.isProcessing()) {
      this.sendMessage.emit(this.userInput);
      this.userInput = '';
    }
  }
}
