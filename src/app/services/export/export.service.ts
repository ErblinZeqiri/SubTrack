import { Injectable, inject } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { Subscription } from 'src/interfaces/interface';
import { ReportsService } from '../reports/reports.service';

export type ExportScope   = 'all' | 'monthly' | 'payments';
export type ExportFormat  = 'pdf' | 'csv' | 'json';
export type ExportPeriod  = 'all' | '6months' | '12months';

export interface ExportOptions {
  scope:        ExportScope;
  format:       ExportFormat;
  period:       ExportPeriod;
  year:         number;
  month:        number;
  currency:     string;
  includeLogos: boolean;
}

interface PaymentRow {
  monthLabel: string;
  name:       string;
  category:   string;
  amount:     number;
  renewal:    string;
}

const LAST_EXPORT_KEY = 'last_export_info';

// ── Palette PDF ──────────────────────────────────────────────────────────────
const C_PURPLE:      [number, number, number] = [124, 58, 237];
const C_PURPLE_DARK: [number, number, number] = [91, 33, 182];
const C_PURPLE_LITE: [number, number, number] = [237, 233, 254];
const C_PURPLE_PALE: [number, number, number] = [250, 245, 255];
const C_WHITE:       [number, number, number] = [255, 255, 255];
const C_DARK:        [number, number, number] = [17, 24, 39];
const C_MUTED:       [number, number, number] = [107, 114, 128];
const C_BORDER:      [number, number, number] = [229, 231, 235];
const C_SUCCESS:     [number, number, number] = [22, 163, 74];
const C_DANGER:      [number, number, number] = [220, 38, 38];
const C_PURPLE_TEXT: [number, number, number] = [196, 181, 253];
const C_PURPLE_200:  [number, number, number] = [221, 214, 254];

const CAT_COLORS: [number, number, number][] = [
  [124, 58, 237],
  [59, 130, 246],
  [34, 197, 94],
  [251, 146, 60],
  [239, 68, 68],
  [236, 72, 153],
  [20, 184, 166],
  [245, 158, 11],
];

@Injectable({ providedIn: 'root' })
export class ExportService {
  private readonly reports = inject(ReportsService);

  // ── API publique ─────────────────────────────────────────────────────────

  async export(subs: Subscription[], opts: ExportOptions): Promise<string> {
    const filename = this.buildFilename(opts);
    let savedName: string;

    if (opts.format === 'csv') {
      const content = this.buildCSV(subs, opts);
      savedName = await this.saveText(content, filename, 'text/csv');
    } else if (opts.format === 'json') {
      const content = JSON.stringify(this.buildJSON(subs, opts), null, 2);
      savedName = await this.saveText(content, filename, 'application/json');
    } else {
      const blob = await this.buildPDF(subs, opts);
      savedName = await this.saveFile(blob, filename);
    }

    await this.saveLastExport(opts);
    return savedName;
  }

  async getLastExport(): Promise<{ date: string; scope: string; format: string } | null> {
    const { value } = await Preferences.get({ key: LAST_EXPORT_KEY });
    return value ? JSON.parse(value) : null;
  }

  // ── CSV ──────────────────────────────────────────────────────────────────

  private buildCSV(subs: Subscription[], opts: ExportOptions): string {
    const rows: string[] = [];
    const now = new Date().toLocaleDateString('fr-FR');

    if (opts.scope === 'all') {
      rows.push(this.csvRow([`# SubTrack — Tous les abonnements — ${now}`]));
      rows.push(this.csvRow([]));
      const headers = ['Service', 'Catégorie', `Montant (${opts.currency})`, 'Renouvellement', 'Prochain paiement'];
      if (opts.includeLogos) headers.push('Logo URL');
      rows.push(this.csvRow(headers));
      const sorted = [...subs].sort((a, b) => b.amount - a.amount);
      for (const sub of sorted) {
        const row = [sub.companyName, sub.category, sub.amount.toFixed(2), sub.renewal, this.formatDate(sub.nextPaymentDate)];
        if (opts.includeLogos) row.push(sub.logo ?? '');
        rows.push(this.csvRow(row));
      }

    } else if (opts.scope === 'monthly') {
      const { y, m } = this.ym(opts);
      const label = this.monthFull(y, m);
      const total = this.reports.getMonthlyTotal(subs, y, m);
      const active = this.reports.getActiveSubscriptions(subs, y, m)
        .sort((a, b) => this.reports.getMonthPaymentAmount(b, y, m) - this.reports.getMonthPaymentAmount(a, y, m));
      const cats = this.reports.getCategoryBreakdown(subs, y, m);

      rows.push(this.csvRow([`# SubTrack — Rapport mensuel — ${label}`]));
      rows.push(this.csvRow([`# Exporté le ${now}`]));
      rows.push(this.csvRow([]));
      rows.push(this.csvRow(['Total du mois', `${total.toFixed(2)} ${opts.currency}`, '', 'Abonnements actifs', `${active.length}`]));
      rows.push(this.csvRow([]));

      rows.push(this.csvRow(['── Prélèvements ──']));
      rows.push(this.csvRow(['Service', 'Catégorie', `Montant (${opts.currency})`]));
      for (const sub of active) {
        const amt = this.reports.getMonthPaymentAmount(sub, y, m);
        rows.push(this.csvRow([sub.companyName, sub.category, amt.toFixed(2)]));
      }
      rows.push(this.csvRow([]));

      rows.push(this.csvRow(['── Répartition par catégorie ──']));
      rows.push(this.csvRow(['Catégorie', `Total (${opts.currency})`, 'Part (%)']));
      for (const cat of cats) {
        rows.push(this.csvRow([cat.name, cat.total.toFixed(2), `${cat.percent}%`]));
      }

    } else {
      rows.push(this.csvRow([`# SubTrack — Historique des paiements — ${now}`]));
      rows.push(this.csvRow([]));
      rows.push(this.csvRow(['Mois', 'Service', 'Catégorie', `Montant (${opts.currency})`, 'Renouvellement']));
      for (const row of this.buildPaymentRows(subs, opts)) {
        rows.push(this.csvRow([row.monthLabel, row.name, row.category, row.amount.toFixed(2), row.renewal]));
      }
    }

    return rows.join('\n');
  }

  private csvRow(cells: string[]): string {
    return cells.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',');
  }

  // ── JSON ─────────────────────────────────────────────────────────────────

  private buildJSON(subs: Subscription[], opts: ExportOptions): object {
    const exportedAt = new Date().toISOString();

    if (opts.scope === 'all') {
      return {
        exportedAt,
        scope: 'all_subscriptions',
        count: subs.length,
        subscriptions: subs.map(s => ({
          name: s.companyName, category: s.category,
          amount: s.amount, currency: opts.currency,
          renewal: s.renewal,
          nextPaymentDate: this.formatDate(s.nextPaymentDate),
          domain: s.domain,
          ...(opts.includeLogos ? { logo: s.logo } : {}),
        })),
      };
    }

    if (opts.scope === 'monthly') {
      const { y, m } = this.ym(opts);
      const total = this.reports.getMonthlyTotal(subs, y, m);
      const active = this.reports.getActiveSubscriptions(subs, y, m);
      return {
        exportedAt,
        scope: 'monthly_report',
        month: this.monthFull(y, m),
        total: { amount: parseFloat(total.toFixed(2)), currency: opts.currency },
        subscriptions: active.map(s => ({
          name: s.companyName, category: s.category,
          amount: parseFloat(this.reports.getMonthPaymentAmount(s, y, m).toFixed(2)),
          currency: opts.currency,
          ...(opts.includeLogos ? { logo: s.logo } : {}),
        })),
        categories: this.reports.getCategoryBreakdown(subs, y, m),
      };
    }

    return {
      exportedAt,
      scope: 'payment_history',
      payments: this.buildPaymentRows(subs, opts).map(r => ({
        month: r.monthLabel, name: r.name, category: r.category,
        amount: parseFloat(r.amount.toFixed(2)), currency: opts.currency,
        renewal: r.renewal,
      })),
    };
  }

  // ── PDF ──────────────────────────────────────────────────────────────────

  private async buildPDF(subs: Subscription[], opts: ExportOptions): Promise<Blob> {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const exportDate = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

    if (opts.scope === 'monthly') {
      this.pdfMonthly(doc, subs, opts, pageW);
    } else if (opts.scope === 'all') {
      this.pdfAll(doc, subs, opts, pageW);
    } else {
      this.pdfPayments(doc, subs, opts, pageW);
    }

    this.pdfFooter(doc, pageW, exportDate);
    return doc.output('blob');
  }

  // ── Layout mensuel ───────────────────────────────────────────────────────

  private pdfMonthly(doc: jsPDF, subs: Subscription[], opts: ExportOptions, pageW: number): void {
    const { year, month, currency } = opts;
    const total     = this.reports.getMonthlyTotal(subs, year, month);
    const prevY     = month === 0 ? year - 1 : year;
    const prevM     = month === 0 ? 11 : month - 1;
    const prevTotal = this.reports.getMonthlyTotal(subs, prevY, prevM);
    const diff      = prevTotal > 0 ? ((total - prevTotal) / prevTotal) * 100 : 0;
    const active    = this.reports.getActiveSubscriptions(subs, year, month)
      .sort((a, b) => this.reports.getMonthPaymentAmount(b, year, month) - this.reports.getMonthPaymentAmount(a, year, month));
    const cats      = this.reports.getCategoryBreakdown(subs, year, month);
    const insights  = this.reports.getInsights(subs, year, month, currency);
    const label     = this.monthFull(year, month);

    let y = this.drawHeader(doc, pageW, 'Rapport Mensuel', label, `${active.length} prélèvement${active.length !== 1 ? 's' : ''}`);

    // ── Cartes stats ────────────────────────────────────────────────────────
    y += 8;
    const cardH = 34;

    this.drawStatCard(doc, 14, y, 86, cardH);
    doc.setFont('helvetica', 'bold').setFontSize(8).setTextColor(...C_MUTED);
    doc.text('TOTAL DU MOIS', 22, y + 9);
    doc.setFont('helvetica', 'bold').setFontSize(22).setTextColor(...C_DARK);
    doc.text(`${total.toFixed(2)} ${currency}`, 22, y + 22);
    if (prevTotal > 0) {
      const sign = diff >= 0 ? '+' : '';
      const [r, g, b] = diff > 0.5 ? C_DANGER : diff < -0.5 ? C_SUCCESS : C_MUTED;
      doc.setFont('helvetica', 'bold').setFontSize(8).setTextColor(r, g, b);
      doc.text(`${sign}${diff.toFixed(1)}% vs ${this.reports.formatMonthLabel(prevY, prevM)}`, 22, y + 30);
    }

    this.drawStatCard(doc, 108, y, 88, cardH);
    doc.setFont('helvetica', 'bold').setFontSize(8).setTextColor(...C_MUTED);
    doc.text('ABONNEMENTS ACTIFS', 116, y + 9);
    doc.setFont('helvetica', 'bold').setFontSize(32).setTextColor(...C_PURPLE);
    doc.text(`${active.length}`, 116, y + 26);

    y += cardH + 12;

    // ── Répartition catégories ──────────────────────────────────────────────
    if (cats.length > 0) {
      y = this.drawSectionTitle(doc, pageW, y, 'RÉPARTITION PAR CATÉGORIE');
      y += 4;
      y = this.drawCategoryBars(doc, pageW, y, cats, currency);
      y += 6;
    }

    // ── Tableau prélèvements ────────────────────────────────────────────────
    y = this.drawSectionTitle(doc, pageW, y, 'PRÉLÈVEMENTS DU MOIS');

    // Largeurs : icone 10 + service 52 + catégorie 38 + montant 28 + renouvellement 54 = 182
    autoTable(doc, {
      startY: y + 2,
      head: [['', 'Service', 'Catégorie', `Montant (${currency})`, 'Renouvellement']],
      body: active.map(s => ['', s.companyName, s.category,
        this.reports.getMonthPaymentAmount(s, year, month).toFixed(2), s.renewal]),
      ...this.tableStyle(),
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 52 },
        2: { cellWidth: 38 },
        3: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
        4: { cellWidth: 54 },
      },
      didDrawCell: (data: any) => this.drawInitialBadge(doc, data, active),
    });

    y = (doc as any).lastAutoTable.finalY + 10;

    // ── Insights ────────────────────────────────────────────────────────────
    if (insights.length > 0 && y < 255) {
      y = this.drawSectionTitle(doc, pageW, y, 'POINTS CLÉS');
      y += 4;
      for (const tip of insights.slice(0, 3)) {
        if (y > 268) break;
        const color: [number, number, number] =
          tip.type === 'good'    ? C_SUCCESS :
          tip.type === 'warning' ? C_DANGER  :
          tip.type === 'alert'   ? C_PURPLE  : C_MUTED;
        doc.setFillColor(...color);
        doc.circle(17, y + 1.5, 1.8, 'F');
        doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(...C_DARK);
        const lines = doc.splitTextToSize(tip.text, pageW - 48);
        doc.text(lines, 22, y + 3.5);
        if (tip.sub) {
          doc.setFontSize(8).setTextColor(...C_MUTED);
          doc.text(tip.sub, 22, y + 3.5 + lines.length * 4.5);
          y += lines.length * 4.5 + 8;
        } else {
          y += lines.length * 4.5 + 5;
        }
      }
    }
  }

  // ── Layout tous les abonnements ──────────────────────────────────────────

  private pdfAll(doc: jsPDF, subs: Subscription[], opts: ExportOptions, pageW: number): void {
    const { currency } = opts;
    const sorted = [...subs].sort((a, b) => b.amount - a.amount);
    const monthlyTotal = subs.reduce((s, sub) => s + sub.amount, 0);

    let y = this.drawHeader(doc, pageW, 'Tous les abonnements',
      new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }),
      `${subs.length} service${subs.length !== 1 ? 's' : ''}`);

    y += 8;
    const cardH = 30;

    this.drawStatCard(doc, 14, y, 86, cardH);
    doc.setFont('helvetica', 'bold').setFontSize(8).setTextColor(...C_MUTED);
    doc.text('COÛT MENSUEL ESTIMÉ', 22, y + 8);
    doc.setFont('helvetica', 'bold').setFontSize(20).setTextColor(...C_DARK);
    doc.text(`${monthlyTotal.toFixed(2)} ${currency}`, 22, y + 21);

    this.drawStatCard(doc, 108, y, 88, cardH);
    doc.setFont('helvetica', 'bold').setFontSize(8).setTextColor(...C_MUTED);
    doc.text('ABONNEMENTS', 116, y + 8);
    doc.setFont('helvetica', 'bold').setFontSize(28).setTextColor(...C_PURPLE);
    doc.text(`${subs.length}`, 116, y + 22);

    y += cardH + 12;
    y = this.drawSectionTitle(doc, pageW, y, 'LISTE DES ABONNEMENTS');

    // Largeurs : icone 10 + service 50 + catégorie 35 + montant 22 + renouvellement 30 + date 35 = 182
    autoTable(doc, {
      startY: y + 2,
      head: [['', 'Service', 'Catégorie', `Montant (${currency})`, 'Renouvellement', 'Prochain paiement']],
      body: sorted.map(s => ['', s.companyName, s.category, s.amount.toFixed(2),
        s.renewal, this.formatDate(s.nextPaymentDate)]),
      ...this.tableStyle(),
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 50 },
        2: { cellWidth: 35 },
        3: { cellWidth: 22, halign: 'right', fontStyle: 'bold' },
        4: { cellWidth: 30 },
        5: { cellWidth: 35 },
      },
      didDrawCell: (data: any) => this.drawInitialBadge(doc, data, sorted),
    });
  }

  // ── Layout historique paiements ──────────────────────────────────────────

  private pdfPayments(doc: jsPDF, subs: Subscription[], opts: ExportOptions, pageW: number): void {
    const { currency } = opts;
    const months  = this.periodMonths(opts);
    const allRows = this.buildPaymentRows(subs, opts);
    const grandTotal = allRows.reduce((s, r) => s + r.amount, 0);
    const periodLabel = opts.period === '6months' ? '6 derniers mois'
      : opts.period === '12months' ? '12 derniers mois' : '24 derniers mois';

    let y = this.drawHeader(doc, pageW, 'Historique des paiements',
      periodLabel, `${months.length} mois · ${allRows.length} lignes`);

    y += 8;
    const cardH = 30;

    this.drawStatCard(doc, 14, y, 86, cardH);
    doc.setFont('helvetica', 'bold').setFontSize(8).setTextColor(...C_MUTED);
    doc.text('TOTAL SUR LA PÉRIODE', 22, y + 8);
    doc.setFont('helvetica', 'bold').setFontSize(20).setTextColor(...C_DARK);
    doc.text(`${grandTotal.toFixed(2)} ${currency}`, 22, y + 21);

    this.drawStatCard(doc, 108, y, 88, cardH);
    doc.setFont('helvetica', 'bold').setFontSize(8).setTextColor(...C_MUTED);
    doc.text('PRÉLÈVEMENTS RECONSTRUITS', 116, y + 8);
    doc.setFont('helvetica', 'bold').setFontSize(28).setTextColor(...C_PURPLE);
    doc.text(`${allRows.length}`, 116, y + 22);

    y += cardH + 12;
    y = this.drawSectionTitle(doc, pageW, y, 'DÉTAIL PAR MOIS');

    // Largeurs : mois 28 + service 52 + catégorie 38 + montant 24 + renouvellement 40 = 182
    autoTable(doc, {
      startY: y + 2,
      head: [['Mois', 'Service', 'Catégorie', `Montant (${currency})`, 'Renouvellement']],
      body: allRows.map(r => [r.monthLabel, r.name, r.category, r.amount.toFixed(2), r.renewal]),
      ...this.tableStyle(),
      columnStyles: {
        0: { cellWidth: 28 },
        1: { cellWidth: 52 },
        2: { cellWidth: 38 },
        3: { cellWidth: 24, halign: 'right', fontStyle: 'bold' },
        4: { cellWidth: 40 },
      },
    });
  }

  // ── Éléments PDF partagés ────────────────────────────────────────────────

  private drawHeader(doc: jsPDF, pageW: number, title: string, subtitle: string, meta: string): number {
    const H = 54;

    // Bande principale
    doc.setFillColor(...C_PURPLE);
    doc.rect(0, 0, pageW, H, 'F');

    // Bloc sombre à droite
    doc.setFillColor(...C_PURPLE_DARK);
    doc.rect(pageW * 0.62, 0, pageW * 0.38, H, 'F');

    // Logo / app name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(...C_WHITE);
    doc.text('SubTrack', 14, 20);

    // Tagline
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...C_PURPLE_TEXT);
    doc.text('Gestion d\'abonnements', 14, 28);

    // Séparateur
    doc.setDrawColor(...C_PURPLE_LITE);
    doc.setLineWidth(0.3);
    doc.line(14, 33, pageW * 0.55, 33);

    // Date export
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...C_PURPLE_TEXT);
    doc.text(`Exporté le ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}`, 14, 41);

    // Titre rapport (côté droit)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...C_PURPLE_TEXT);
    doc.text(title.toUpperCase(), pageW - 14, 18, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...C_WHITE);
    doc.text(subtitle, pageW - 14, 30, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...C_PURPLE_200);
    doc.text(meta, pageW - 14, 42, { align: 'right' });

    return H;
  }

  private drawStatCard(doc: jsPDF, x: number, y: number, w: number, h: number): void {
    doc.setFillColor(...C_PURPLE_PALE);
    doc.setDrawColor(...C_PURPLE_LITE);
    doc.setLineWidth(0.5);
    (doc as any).roundedRect(x, y, w, h, 3, 3, 'DF');
    // Accent gauche violet
    doc.setFillColor(...C_PURPLE);
    doc.rect(x, y, 3, h, 'F');
  }

  private drawSectionTitle(doc: jsPDF, pageW: number, y: number, label: string): number {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...C_MUTED);
    doc.text(label, 14, y);
    doc.setDrawColor(...C_BORDER);
    doc.setLineWidth(0.3);
    doc.line(14, y + 2.5, pageW - 14, y + 2.5);
    return y + 4;
  }

  private drawCategoryBars(
    doc: jsPDF, pageW: number, y: number,
    cats: { name: string; total: number; percent: number }[], currency: string,
  ): number {
    const barX    = 76;
    const barW    = 82;
    const barH    = 4.5;
    const rowH    = 11;

    for (let i = 0; i < Math.min(cats.length, 7); i++) {
      const cat   = cats[i];
      const color = CAT_COLORS[i % CAT_COLORS.length];
      const fill  = Math.max((cat.percent / 100) * barW, 0.5);

      // Dot
      doc.setFillColor(...color);
      doc.circle(17, y + rowH / 2, 2, 'F');

      // Nom catégorie
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...C_DARK);
      doc.text(cat.name, 22, y + rowH / 2 + 1.5);

      // Barre fond
      doc.setFillColor(...C_BORDER);
      (doc as any).roundedRect(barX, y + 3, barW, barH, 1.5, 1.5, 'F');

      // Barre remplie
      doc.setFillColor(...color);
      (doc as any).roundedRect(barX, y + 3, fill, barH, 1.5, 1.5, 'F');

      // Pourcentage
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...C_MUTED);
      doc.text(`${cat.percent}%`, barX + barW + 3, y + rowH / 2 + 1.5);

      // Montant
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...C_DARK);
      doc.text(`${cat.total.toFixed(2)} ${currency}`, pageW - 14, y + rowH / 2 + 1.5, { align: 'right' });

      y += rowH;
    }

    return y;
  }

  private drawInitialBadge(doc: jsPDF, data: any, items: Subscription[]): void {
    if (data.section !== 'body' || data.column.index !== 0) return;
    const sub   = items[data.row.index];
    if (!sub) return;
    const color = CAT_COLORS[data.row.index % CAT_COLORS.length];
    const cx    = data.cell.x + 5;
    const cy    = data.cell.y + data.cell.height / 2;
    doc.setFillColor(...color);
    doc.circle(cx, cy, 3.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text(sub.companyName.charAt(0).toUpperCase(), cx, cy + 1.3, { align: 'center' });
  }

  private pdfFooter(doc: jsPDF, pageW: number, exportDate: string): void {
    const pageCount = (doc.internal as any).getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(...C_BORDER);
      doc.setLineWidth(0.3);
      doc.line(14, 283, pageW - 14, 283);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...C_MUTED);
      doc.text(`Généré par SubTrack · ${exportDate}`, 14, 290);
      doc.text(`Page ${i} / ${pageCount}`, pageW - 14, 290, { align: 'right' });
    }
  }

  private tableStyle() {
    return {
      theme: 'plain' as const,
      headStyles: {
        fillColor: C_PURPLE,
        textColor: C_WHITE,
        fontStyle: 'bold' as const,
        fontSize: 9,
        cellPadding: { top: 5, right: 5, bottom: 5, left: 5 },
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: { top: 4, right: 5, bottom: 4, left: 5 },
        textColor: C_DARK,
      },
      alternateRowStyles: { fillColor: C_PURPLE_PALE },
      tableLineColor: C_BORDER,
      tableLineWidth: 0.3,
      margin: { left: 14, right: 14 },
    };
  }

  // ── Données historique paiements ─────────────────────────────────────────

  private buildPaymentRows(subs: Subscription[], opts: ExportOptions): PaymentRow[] {
    const rows: PaymentRow[] = [];
    for (const { y, m } of this.periodMonths(opts)) {
      const label  = this.reports.formatMonthLabel(y, m);
      const active = this.reports.getActiveSubscriptions(subs, y, m)
        .sort((a, b) => this.reports.getMonthPaymentAmount(b, y, m) - this.reports.getMonthPaymentAmount(a, y, m));
      for (const sub of active) {
        rows.push({
          monthLabel: label,
          name:       sub.companyName,
          category:   sub.category,
          amount:     this.reports.getMonthPaymentAmount(sub, y, m),
          renewal:    sub.renewal,
        });
      }
    }
    return rows;
  }

  private periodMonths(opts: ExportOptions): { y: number; m: number }[] {
    const count = opts.period === '6months' ? 6 : opts.period === '12months' ? 12 : 24;
    const result: { y: number; m: number }[] = [];
    for (let i = count - 1; i >= 0; i--) {
      let y = opts.year; let m = opts.month - i;
      while (m < 0) { m += 12; y--; }
      result.push({ y, m });
    }
    return result;
  }

  // ── Sauvegarde fichiers ──────────────────────────────────────────────────

  private async saveText(content: string, filename: string, mimeType: string): Promise<string> {
    const bom  = mimeType.includes('csv') ? '﻿' : '';
    const blob = new Blob([bom + content], { type: `${mimeType};charset=utf-8` });
    return this.saveFile(blob, filename);
  }

  private async saveFile(blob: Blob, filename: string): Promise<string> {
    if (Capacitor.isNativePlatform()) {
      return this.saveNative(blob, filename);
    }
    if (typeof (window as any).showSaveFilePicker === 'function') {
      return this.saveWithPicker(blob, filename);
    }
    return this.saveBlob(blob, filename);
  }

  private async saveNative(blob: Blob, filename: string): Promise<string> {
    const base64 = await this.blobToBase64(blob);

    // Essai 1 : dossier Téléchargements
    try {
      await Filesystem.requestPermissions();
      await Filesystem.writeFile({
        path: `Download/${filename}`,
        data: base64,
        directory: Directory.ExternalStorage,
        recursive: true,
      });
      return `Téléchargements/${filename}`;
    } catch { /* Android 11+ scoped storage → on passe au picker */ }

    // Essai 2 : picker natif (laisser l'utilisateur choisir)
    if (typeof (window as any).showSaveFilePicker === 'function') {
      return this.saveWithPicker(blob, filename);
    }

    // Dernier recours : dossier externe de l'app
    await Filesystem.writeFile({
      path: filename, data: base64,
      directory: Directory.External, recursive: true,
    });
    return filename;
  }

  private async saveWithPicker(blob: Blob, filename: string): Promise<string> {
    const ext    = filename.split('.').pop()!;
    const handle = await (window as any).showSaveFilePicker({
      suggestedName: filename,
      types: [{ description: 'Fichier SubTrack', accept: { [blob.type]: [`.${ext}`] } }],
    });
    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();
    return filename;
  }

  private saveBlob(blob: Blob, filename: string): string {
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
    return filename;
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  private ym(opts: ExportOptions) {
    return { y: opts.year, m: opts.month };
  }

  private formatDate(value: any): string {
    if (!value) return '';
    const d = typeof value?.toDate === 'function' ? value.toDate() : new Date(value);
    return d.toLocaleDateString('fr-FR');
  }

  private monthFull(year: number, month: number): string {
    const s = new Date(year, month, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  private buildFilename(opts: ExportOptions): string {
    const scope = opts.scope === 'all'      ? 'Abonnements'
                : opts.scope === 'monthly'  ? `Rapport-${this.monthFull(opts.year, opts.month).replace(/\s/g, '-')}`
                : 'Paiements';
    return `SubTrack_${scope}.${opts.format}`;
  }

  private async saveLastExport(opts: ExportOptions): Promise<void> {
    const scopeLabel = opts.scope === 'all'     ? 'Tous les abonnements'
                     : opts.scope === 'monthly' ? this.monthFull(opts.year, opts.month)
                     : 'Historique des paiements';
    await Preferences.set({
      key: LAST_EXPORT_KEY,
      value: JSON.stringify({
        date:   new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }),
        scope:  scopeLabel,
        format: opts.format.toUpperCase(),
      }),
    });
  }
}
