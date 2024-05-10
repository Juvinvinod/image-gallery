import { Component, OnInit } from '@angular/core';
import { GalleryService } from '../gallery.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  constructor(private galleryService: GalleryService) {}
  ngOnInit(): void {
    this.galleryService.getImages(1).subscribe({
      next: res => {
        console.log(res);
        localStorage.setItem('imageList', JSON.stringify(res));
      },
    });
  }
}
