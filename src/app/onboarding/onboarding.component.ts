import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonIcon, IonButton, IonCheckbox, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  walletOutline, addCircleOutline, statsChartOutline, starOutline,
} from 'ionicons/icons';

interface OnboardingSlide {
  icon: string;
  title: string;
  text: string;
}

const SWIPE_THRESHOLD_PX = 50;
export const ONBOARDING_DISMISSED_KEY = 'onboarding_dismissed';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule, IonIcon, IonButton, IonCheckbox],
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss'],
})
export class OnboardingComponent implements OnInit {
  ready = false;
  dontShowAgain = false;

  readonly slides: OnboardingSlide[] = [
    {
      icon: 'wallet-outline',
      title: 'Tous vos abonnements au même endroit',
      text: 'Centralisez Netflix, Spotify, salle de sport et tous vos autres abonnements en un seul lieu.',
    },
    {
      icon: 'add-circle-outline',
      title: 'Ajoutez en quelques secondes',
      text: 'Entrez le prix et la date. Abopti fait le reste automatiquement.',
    },
    {
      icon: 'stats-chart-outline',
      title: 'Suivez et maîtrisez vos dépenses',
      text: 'Visualisez vos dépenses mensuelles et annuelles en un coup d\'œil.',
    },
    {
      icon: 'star-outline',
      title: 'Prêt à faire des économies ?',
      text: 'Passez Premium pour des rapports détaillés, des alertes de prix et des abonnements illimités.',
    },
  ];

  activeIndex = 0;

  private readonly modalCtrl = inject(ModalController);
  private touchStartX = 0;
  touchDeltaX = 0;

  constructor() {
    addIcons({ walletOutline, addCircleOutline, statsChartOutline, starOutline });
  }

  ngOnInit(): void {
    setTimeout(() => { this.ready = true; }, 1000);
  }

  get trackTransform(): string {
    return `translateX(calc(-${this.activeIndex * 100}% + ${this.touchDeltaX}px))`;
  }

  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.touches[0].clientX;
    this.touchDeltaX = 0;
  }

  onTouchMove(event: TouchEvent): void {
    this.touchDeltaX = event.touches[0].clientX - this.touchStartX;
  }

  onTouchEnd(): void {
    if (this.touchDeltaX <= -SWIPE_THRESHOLD_PX && this.activeIndex < this.slides.length - 1) {
      this.activeIndex++;
    } else if (this.touchDeltaX >= SWIPE_THRESHOLD_PX && this.activeIndex > 0) {
      this.activeIndex--;
    }
    this.touchDeltaX = 0;
  }

  goToSlide(index: number): void {
    this.activeIndex = index;
  }

  next(): void {
    if (this.activeIndex < this.slides.length - 1) {
      this.activeIndex++;
    } else {
      this.dismiss();
    }
  }

  async dismiss(): Promise<void> {
    // localStorage (et non Preferences) : ce flag doit survivre à un logout,
    // qui appelle Preferences.clear() pour des raisons de sécurité.
    if (this.dontShowAgain) {
      localStorage.setItem(ONBOARDING_DISMISSED_KEY, 'true');
    }
    await this.modalCtrl.dismiss();
  }
}
