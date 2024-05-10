import { Injectable } from '@angular/core';
import { environment } from './../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Photos } from './photos';

@Injectable({
  providedIn: 'root',
})
export class GalleryService {
  apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  //function to get images from the api
  getImages(pageNumber: number): Observable<Photos[]> {
    let queryParams = new HttpParams();
    queryParams = queryParams.append('page', pageNumber);
    queryParams = queryParams.append('limit', 30);
    return this.http.get<Photos[]>(this.apiUrl, { params: queryParams });
  }
}
