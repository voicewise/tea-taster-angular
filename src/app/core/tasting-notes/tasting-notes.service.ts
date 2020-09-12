import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { TastingNote } from '@app/models';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class TastingNotesService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Array<TastingNote>> {
    return this.http.get<Array<TastingNote>>(
      `${environment.dataService}/user-tasting-notes`,
    );
  }

  get(id: number): Observable<TastingNote> {
    return this.http.get<TastingNote>(
      `${environment.dataService}/user-tasting-notes/${id}`,
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(
      `${environment.dataService}/user-tasting-notes/${id}`,
    );
  }

  save(note: TastingNote): Observable<TastingNote> {
    let url = `${environment.dataService}/user-tasting-notes`;
    if (note.id) {
      url += `/${note.id}`;
    }
    return this.http.post<TastingNote>(url, note);
  }
}
