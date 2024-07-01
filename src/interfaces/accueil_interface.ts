export interface ExempleFirebaseSubscriptions {
    [subscriptionID: string]: {
        name: string;
        amount: number;
        nextBillingDate: Date;
        status: string;
    };
}

export interface ExempleFirebaseUsers {
    [userID: string]: {
        totalSpent: number;
        upcomingBills: number;
        spendingHistory?: { date: Date; amount: number }[];
        notifications?: {
            [notificationID: string]: {
                title: string;
                message: string;
                date: Date;
                read: boolean;
            };
        };
    };
}

export interface AccueilInterface{
    composant: string;
    données: {
        id?: string;
        name?: string;
        amount?: number;
        nextBillingDate?: Date;
        status?: string;
        totalSpent?: number;
        upcomingBills?: number;
        data?: { date: Date; amount: number }[];
        title?: string;
        message?: string;
        date?: Date;
        read?: boolean;
        menuItems?: { name: string; route: string }[];
    };
    exemple_Firebase: ExempleFirebaseSubscriptions | ExempleFirebaseUsers;
}

export interface Accueil {
    Composants_clés: AccueilInterface[];
}