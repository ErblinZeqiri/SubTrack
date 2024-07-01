import { Component } from '@angular/core';
import { Accueil } from '../../interfaces/accueil_interface';

@Component({
  selector: 'app-sub-list',
  standalone: true,
  imports: [],
  templateUrl: './sub-list.component.html',
  styleUrl: './sub-list.component.css',
})
export class SubListComponent {
  accueilData: Accueil = {
    Composants_clés: [],
  };
}
