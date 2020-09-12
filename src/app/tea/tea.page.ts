import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Tea } from '@app/models';
import { TeaService } from '@app/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-tea',
  templateUrl: 'tea.page.html',
  styleUrls: ['tea.page.scss'],
})
export class TeaPage implements OnInit {
  teaMatrix$: Observable<Array<Array<Tea>>>;

  constructor(private navController: NavController, private tea: TeaService) {}

  ngOnInit() {
    this.teaMatrix$ = this.tea
      .getAll()
      .pipe(map((teas: Array<Tea>) => this.listToMatrix(teas)));
  }

  showDetailsPage(id: number) {
    this.navController.navigateForward(['tabs', 'tea', 'tea-details', id]);
  }

  private listToMatrix(teas: Array<Tea>): Array<Array<Tea>> {
    const matrix: Array<Array<Tea>> = [];
    let row = [];
    teas.forEach(t => {
      row.push(t);
      if (row.length === 4) {
        matrix.push(row);
        row = [];
      }
    });

    if (row.length) {
      matrix.push(row);
    }

    return matrix;
  }
}
