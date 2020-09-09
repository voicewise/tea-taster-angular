import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, EMPTY } from 'rxjs';

import { Tea } from '@app/models';
import { environment } from '@env/environment';
import { map } from 'rxjs/operators';

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
      .pipe(map((teas: Array<any>) => teas.map(t => this.convert(t))));
  }

  get(id: number): Observable<Tea> {
    return this.http
      .get(`${environment.dataService}/tea-categories/${id}`)
      .pipe(map((t: any) => this.convert(t)));
  }

  private convert(tea: any): Tea {
    return {
      ...tea,
      image: `assets/img/${this.images[tea.id - 1]}.jpg`,
    };
  }
}
