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
  deadline: Date | string;
}

export interface Payment {
  amount: number;
  date: Date;
}
