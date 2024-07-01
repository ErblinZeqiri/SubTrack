export interface PaymentHistory {
  date: string;
  amount: number;
  status: string;
}

export interface Subscription {
  subscriptionID: string;
  name: string;
  amount: number;
  nextBillingDate: string;
  status: string;
  paymentHistory: PaymentHistory[];
}

export interface SpendingHistory {
  date: string;
  amount: number;
}

export interface NotificationPreference {
  type: string;
  enabled: boolean;
}

export interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionManagement: string;
}

export interface DisplayPreferences {
  theme: string;
  language: string;
}

export interface User {
  userID: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  subscriptions: { [key: string]: Subscription };
  spendingHistory: SpendingHistory[];
  notificationPreferences: NotificationPreference[];
  securitySettings: SecuritySettings;
  displayPreferences: DisplayPreferences;
}
