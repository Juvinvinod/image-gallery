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

  // slice the page required from local storage and return it
  getFromLocalStorage(pageNumber: number): Photos[] | [] {
    const item = localStorage.getItem('imageList');
    if (item) {
      const parsedData = JSON.parse(item);
      const firstItemIndex = (pageNumber - 1) * 30;
      const lastItemIndex = firstItemIndex + 30;
      const slicedData = parsedData.slice(firstItemIndex, lastItemIndex);
      return slicedData;
    } else {
      return [];
    }
  }

  // make an api call with the page number required and return the response
  getDataFromApi(pageNumber: number): Observable<Photos[]> {
    let queryParams = new HttpParams();
    queryParams = queryParams.append('page', pageNumber);
    queryParams = queryParams.append('limit', 30);
    return this.http.get<Photos[]>(this.apiUrl, {
      params: queryParams,
    });
  }

  // check if images are already stored in local storage and store the new response along with old one.
  saveToLocalStorage(res: Photos[]): void {
    let datas = [];
    const item = localStorage.getItem('imageList');
    if (item) {
      datas = JSON.parse(item);
    }
    datas = [...datas, ...res];
    console.log(datas);
    localStorage.setItem('imageList', JSON.stringify(datas));
  }

  //check if there is a document with the passed id in local storage and then delete it.
  deleteFromLocalStorage(id: string): void {
    let datas = [];
    const item = localStorage.getItem('imageList');
    if (!item) {
      return;
    }
    datas = JSON.parse(item);
    const filteredData = datas.filter((item: Photos) => {
      return item.id !== id;
    });
    localStorage.setItem('imageList', JSON.stringify(filteredData));
  }
}
