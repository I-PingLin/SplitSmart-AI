
export interface ReceiptItem {
  id: string;
  name: string;
  price: number;
  assignedTo: string[];
}

export interface BillState {
  items: ReceiptItem[];
  tax: number;
  tip: number;
  people: string[];
}

export interface PersonSummary {
  name: string;
  subtotal: number;
  taxShare: number;
  tipShare: number;
  total: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}
