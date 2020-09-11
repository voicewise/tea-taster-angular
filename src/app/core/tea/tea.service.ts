import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Plugins } from '@capacitor/core';

import { Tea } from '@app/models';
import { environment } from '@env/environment';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class TeaService {
  private images: Array<string> = [
    'green',
    'black',
    'herbal',
    'oolong',
    'dark',
    'puer',
    'white',
    'yellow',
  ];

  constructor(private http: HttpClient) {}

  getAll(): Observable<Array<Tea>> {
    return this.http
      .get(`${environment.dataService}/tea-categories`)
      .pipe(
        switchMap((teas: Array<any>) =>
          Promise.all(teas.map(t => this.convert(t))),
        ),
      );
  }

  get(id: number): Observable<Tea> {
    return this.http
      .get(`${environment.dataService}/tea-categories/${id}`)
      .pipe(switchMap((t: any) => this.convert(t)));
  }

  save(tea: Tea): Promise<void> {
    const { Storage } = Plugins;
    return Storage.set({
      key: `rating${tea.id}`,
      value: tea.rating.toString(),
    });
  }

  private async convert(tea: any): Promise<Tea> {
    const { Storage } = Plugins;
    const rating = await Storage.get({ key: `rating${tea.id}` });
    return {
      ...tea,
      image: `assets/img/${this.images[tea.id - 1]}.jpg`,
      rating: parseInt((rating && rating.value) || '0', 10),
    };
  }
}
