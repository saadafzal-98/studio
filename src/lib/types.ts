export interface Bill {
  id: number;
  date: string;
  amount: number | '';
}

export interface ReceiptData {
  date: string;
  weight: number;
  rate: number;
  previousBills: Bill[];
}
