import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Photos } from '../photos';

@Component({
  selector: 'app-image-details',
  templateUrl: './image-details.component.html',
  styleUrl: './image-details.component.css',
})
export class ImageDetailsComponent implements OnInit {
  imageDetails!: Photos[];
  constructor(
    private route: ActivatedRoute,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id']; // Extract the id parameter from the route
      const list = localStorage.getItem('imageList');
      if (list) {
        const array = JSON.parse(list);
        this.imageDetails = array.filter(
          (element: Photos) => element.id === id
        );
      } else {
        this.goBack(); // if there is no items available in local storage, go back.
      }
    });
  }

  //open a new tab with image for the user to download the image.
  downloadImage() {
    window.open(this.imageDetails[0].download_url, '_blank');
  }

  //go back to the previous page
  goBack() {
    // Navigate back using a relative path
    this._router.navigate(['../']);
  }
}
