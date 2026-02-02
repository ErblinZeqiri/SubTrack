/**
 * Constantes liées aux abonnements
 * À utiliser dans tous les composants pour éviter la duplication
 */

export const SUBSCRIPTION_CATEGORIES = [
  'Divertissement',
  'Indispensable',
  'Streaming',
  'Presse',
  'Fitness',
  'Jeux',
  'Cuisine',
  'Éducation',
  'Technologie',
  'Mode',
  'Finance',
  'Voyage',
] as const;

export const SUBSCRIPTION_RENEWAL_TYPES = [
  'Hebdomadaire',
  'Mensuel',
  'Trimestriel',
  'Semestriel',
  'Annuel',
] as const;

export const SUBSCRIPTION_DEADLINE_TYPES = [
  'Indéterminée',
  'Date de fin',
] as const;

export type SubscriptionCategory = (typeof SUBSCRIPTION_CATEGORIES)[number];
export type SubscriptionRenewalType =
  (typeof SUBSCRIPTION_RENEWAL_TYPES)[number];
export type SubscriptionDeadlineType =
  (typeof SUBSCRIPTION_DEADLINE_TYPES)[number];
