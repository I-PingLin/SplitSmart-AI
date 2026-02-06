
import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AiService } from './services/ai.service';
import { ReceiptItem, BillState, PersonSummary, ChatMessage } from './models/bill.model';
import { ReceiptDisplayComponent } from './components/receipt-display.component';
import { ChatInterfaceComponent } from './components/chat-interface.component';
import { BillSummaryComponent } from './components/bill-summary.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, ReceiptDisplayComponent, ChatInterfaceComponent, BillSummaryComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private aiService = inject(AiService);

  bill = signal<BillState>({
    items: [],
    tax: 0,
    tip: 0,
    people: []
  });

  messages = signal<ChatMessage[]>([
    { role: 'assistant', text: 'Upload a receipt to get started! Then tell me who had what.', timestamp: new Date() }
  ]);

  isProcessing = signal(false);

  summaries = computed<PersonSummary[]>(() => {
    const currentBill = this.bill();
    const itemMap = new Map<string, PersonSummary>();

    // Initialize map for all unique people assigned
    const people = new Set<string>();
    currentBill.items.forEach(item => {
      item.assignedTo.forEach(person => people.add(person));
    });

    const totalSubtotal = currentBill.items.reduce((sum, item) => sum + item.price, 0);
    if (totalSubtotal === 0) return [];

    people.forEach(person => {
      let personSubtotal = 0;
      currentBill.items.forEach(item => {
        if (item.assignedTo.includes(person)) {
          personSubtotal += (item.price / item.assignedTo.length);
        }
      });

      const taxShare = (personSubtotal / totalSubtotal) * currentBill.tax;
      const tipShare = (personSubtotal / totalSubtotal) * currentBill.tip;

      itemMap.set(person, {
        name: person,
        subtotal: personSubtotal,
        taxShare,
        tipShare,
        total: personSubtotal + taxShare + tipShare
      });
    });

    return Array.from(itemMap.values());
  });

  async onReceiptUpload(file: File) {
    this.isProcessing.set(true);
    try {
      const base64 = await this.fileToBase64(file);
      const parsed = await this.aiService.parseReceipt(base64);
      
      const newItems: ReceiptItem[] = (parsed.items || []).map((item, index) => ({
        id: `item-${Date.now()}-${index}`,
        name: item.name || 'Unknown Item',
        price: item.price || 0,
        assignedTo: []
      }));

      this.bill.update(b => ({
        ...b,
        items: newItems,
        tax: parsed.tax || 0,
        tip: parsed.tip || 0
      }));

      this.addMessage('assistant', `I've loaded ${newItems.length} items. Total: $${(newItems.reduce((s, i) => s + i.price, 0) + (parsed.tax || 0) + (parsed.tip || 0)).toFixed(2)}. Who shared what?`);
    } catch (err) {
      console.error(err);
      this.addMessage('assistant', "Sorry, I couldn't read that receipt. Please try another image.");
    } finally {
      this.isProcessing.set(false);
    }
  }

  async onSendMessage(text: string) {
    if (!text.trim()) return;
    this.addMessage('user', text);
    
    this.isProcessing.set(true);
    try {
      const items = this.bill().items;
      if (items.length === 0) {
        this.addMessage('assistant', "Please upload a receipt first!");
        return;
      }

      const result = await this.aiService.interpretCommand(text, items);
      
      if (result.intent === 'ASSIGN' && result.people.length > 0) {
        this.updateAssignments(result.people, result.itemSearch);
        this.addMessage('assistant', `Got it. Assigned ${result.itemSearch} to ${result.people.join(' and ')}.`);
      } else {
        this.addMessage('assistant', "I'm not sure what you mean. Try something like 'Dhruv had the nachos'.");
      }
    } catch (err) {
      console.error(err);
      this.addMessage('assistant', "Something went wrong processing your request.");
    } finally {
      this.isProcessing.set(false);
    }
  }

  private updateAssignments(people: string[], search: string) {
    this.bill.update(state => {
      const lowerSearch = search.toLowerCase();
      const updatedItems = state.items.map(item => {
        if (item.name.toLowerCase().includes(lowerSearch)) {
          // Merge people into assignment, avoid duplicates
          const newAssigned = Array.from(new Set([...item.assignedTo, ...people]));
          return { ...item, assignedTo: newAssigned };
        }
        return item;
      });
      return { ...state, items: updatedItems };
    });
  }

  private addMessage(role: 'user' | 'assistant', text: string) {
    this.messages.update(m => [...m, { role, text, timestamp: new Date() }]);
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = error => reject(error);
    });
  }
}
