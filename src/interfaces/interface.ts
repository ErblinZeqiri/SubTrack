import { Timestamp } from '@angular/fire/firestore';

export interface User {
  id: string;
  fullName: string;
  email: string;
}

export interface Subscription {
  id: string;
  userID: string;
  name: string;
  domain: string;
  amount: number;
  category: string;
  renewal: string;
  nextPaymentDate: Timestamp;
  paymentHistory: { [key: string]: { amount: number; date: Timestamp } };
}
