import { Injectable } from '@angular/core';
import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
import { Preferences } from '@capacitor/preferences';
import { BehaviorSubject, Observable } from 'rxjs';
import { Capacitor } from '@capacitor/core';

// ─────────────────────────────────────────────────────────────────────────────
// À remplir avec tes clés RevenueCat (Settings → API Keys dans le dashboard)
// ─────────────────────────────────────────────────────────────────────────────
export const RC_ANDROID_API_KEY = 'test_MdUQFWHoxqWNLHHmkmOZOYWWSLq';
export const RC_ENTITLEMENT     = 'premium';

// Limites du plan gratuit
export const FREE_SUB_LIMIT    = 8;
export const FREE_EXPORT_LIMIT = 2;

export type Plan = 'free' | 'premium';

@Injectable({ providedIn: 'root' })
export class PlanService {

  private readonly _plan$   = new BehaviorSubject<Plan>('free');
  private initialized       = false;
  private currentUserId: string | null = null;

  readonly plan$: Observable<Plan>    = this._plan$.asObservable();
  get isPremium(): boolean            { return this._plan$.value === 'premium'; }
  get plan(): Plan                    { return this._plan$.value; }

  // ── Initialisation ──────────────────────────────────────────────────────────

  async init(userId: string): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      // Sur web/dev : toujours gratuit, pas d'appel SDK
      return;
    }

    try {
      if (!this.initialized) {
        await Purchases.setLogLevel({ level: LOG_LEVEL.ERROR });
        await Purchases.configure({
          apiKey: RC_ANDROID_API_KEY,
          appUserID: userId,
        });
        this.initialized = true;
        this.currentUserId = userId;
      } else if (this.currentUserId !== userId) {
        await Purchases.logIn({ appUserID: userId });
        this.currentUserId = userId;
      }
      await this.refresh();
    } catch (e) {
      console.error('[PlanService] init error', e);
    }
  }

  async logOut(): Promise<void> {
    this._plan$.next('free');
    this.currentUserId = null;
    if (!Capacitor.isNativePlatform() || !this.initialized) return;
    try {
      await Purchases.logOut();
    } catch (e) {
      console.error('[PlanService] logOut error', e);
    }
  }

  async refresh(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    try {
      const { customerInfo } = await Purchases.getCustomerInfo();
      const active = customerInfo.entitlements.active[RC_ENTITLEMENT] !== undefined;
      this._plan$.next(active ? 'premium' : 'free');
    } catch (e) {
      console.error('[PlanService] refresh error', e);
    }
  }

  // ── Achat ───────────────────────────────────────────────────────────────────

  async getOfferings() {
    if (!Capacitor.isNativePlatform()) return null;
    try {
      return await Purchases.getOfferings();
    } catch {
      return null;
    }
  }

  async purchasePackage(pkg: any): Promise<boolean> {
    try {
      const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
      const active = customerInfo.entitlements.active[RC_ENTITLEMENT] !== undefined;
      this._plan$.next(active ? 'premium' : 'free');
      return active;
    } catch (e: any) {
      if (e?.code === 'PURCHASE_CANCELLED') return false;
      throw e;
    }
  }

  async restorePurchases(): Promise<boolean> {
    try {
      const { customerInfo } = await Purchases.restorePurchases();
      const active = customerInfo.entitlements.active[RC_ENTITLEMENT] !== undefined;
      this._plan$.next(active ? 'premium' : 'free');
      return active;
    } catch {
      return false;
    }
  }

  // ── Limites gratuites ───────────────────────────────────────────────────────

  async canExport(): Promise<{ allowed: boolean; used: number; limit: number }> {
    if (this.isPremium) return { allowed: true, used: 0, limit: Infinity };
    const used  = await this.getExportCount();
    return { allowed: used < FREE_EXPORT_LIMIT, used, limit: FREE_EXPORT_LIMIT };
  }

  async recordExport(): Promise<void> {
    const key   = this.exportKey();
    const { value } = await Preferences.get({ key });
    await Preferences.set({ key, value: String(parseInt(value ?? '0') + 1) });
  }

  async getExportCount(): Promise<number> {
    const { value } = await Preferences.get({ key: this.exportKey() });
    return parseInt(value ?? '0');
  }

  canAddSubscription(currentCount: number): boolean {
    return this.isPremium || currentCount < FREE_SUB_LIMIT;
  }

  private exportKey(): string {
    const d = new Date();
    return `export_count_${d.getFullYear()}_${d.getMonth()}`;
  }
}
