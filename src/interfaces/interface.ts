export interface User {
  id: string;
  fullName: string;
  email: string;
}

export interface Subscription {
  id: string;
  userID: string;
  companyName: string;
  domain: string;
  logo: string;
  amount: number;
  category: string;
  renewal: string;
  nextPaymentDate: Date;
  paymentHistory: { [key: string]: Payment };
}

export interface Payment {
  amount: number;
  date: Date;
}
