import { Component } from '@angular/core';
import { SubListComponent } from '../sub-list/sub-list.component';

@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [SubListComponent],
  templateUrl: './accueil.component.html',
  styleUrl: './accueil.component.css'
})
export class AccueilComponent {

}
