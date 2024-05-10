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
  // getImages(pageNumber: number): Observable<Photos[]> {
  //   const localItem = this.getFromLocalStorage(pageNumber);
  //   if (localItem) {
  //     return localItem;
  //   } else {
  //     return this.getDataFromApi(pageNumber);
  //   }
  // }

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

  getDataFromApi(pageNumber: number): Observable<Photos[]> {
    let queryParams = new HttpParams();
    queryParams = queryParams.append('page', pageNumber);
    queryParams = queryParams.append('limit', 30);
    return this.http.get<Photos[]>(this.apiUrl, {
      params: queryParams,
    });
  }

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
