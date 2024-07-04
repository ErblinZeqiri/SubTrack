import { Component } from '@angular/core';
import { SubListComponent } from '../sub-list/sub-list.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [SubListComponent, RouterOutlet],
  templateUrl: './accueil.component.html',
  styleUrl: './accueil.component.css'
})
export class AccueilComponent {

}
