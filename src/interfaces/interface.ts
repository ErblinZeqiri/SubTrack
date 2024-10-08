export interface User {
  uid: string;
  fullName: string;
  email: string;
  password: string;
  salt: string;
}

export interface Subscription {
  id: string;
  companyName: string;
  nextPaymentDate: string | null;
  amount: number;
  category: string;
  renewal: string;
  paymentHistory: Payment[];
  deadline: string | null;
  domain: string;
  logo: string;
  userID: string;
}

export interface Payment {
  date: Date;
  amount: number;
}
