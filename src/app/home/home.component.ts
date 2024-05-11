import {
  AfterViewInit,
  Component,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { GalleryService } from '../gallery.service';
import { Photos } from '../photos';
import { BreakpointObserver } from '@angular/cdk/layout';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import {
  BehaviorSubject,
  Subscription,
  filter,
  map,
  pairwise,
  throttleTime,
  timer,
} from 'rxjs';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(CdkVirtualScrollViewport) scroller!: CdkVirtualScrollViewport; //for infinite scroll
  loading = false; // hide the loader by default
  pageNumber = 1; // page number used for fetching data
  displayType!: string; // grid or list
  isLargeScreen!: boolean; // to make grid responsive
  imageSubscription!: Subscription;

  // Declare imageList$ as a BehaviorSubject
  imageList$: BehaviorSubject<Photos[]> = new BehaviorSubject<Photos[]>([]);

  constructor(
    private galleryService: GalleryService,
    private breakpointObserver: BreakpointObserver,
    private ngZone: NgZone,
    private _router: Router,
    private snackBar: MatSnackBar
  ) {}

  //show only 1 col per row in grid view on smaller screens and 3 in larger screen.
  getGridCols(): number {
    return this.breakpointObserver.isMatched('(max-width: 1024px)') ? 1 : 3;
  }

  //save displayType to variable when the toggle button is clicked.
  onViewTypeChange(viewType: string) {
    this.displayType = viewType;
    this.ngAfterViewInit();
  }

  //fetch next pages containing data
  fetchMore() {
    this.loading = true;
    this.pageNumber++;
    this.getImages(this.pageNumber);
  }

  // check if data already exists in local storage else make the api call.
  getImages(pageNumber: number): void {
    const localItem = this.galleryService.getFromLocalStorage(pageNumber);
    if (localItem?.length !== 0) {
      this.imageList$.next([...this.imageList$.value, ...localItem]);
      console.log(this.imageList$.value);
      this.loading = true;
    } else {
      this.imageSubscription = this.galleryService
        .getDataFromApi(pageNumber)
        .subscribe({
          next: res => {
            this.imageList$.next([...this.imageList$.value, ...res]);
            this.galleryService.saveToLocalStorage(res);
            this.loading = true;
          },
          error: () => {
            this.snackBar.open('Error fetching data!!', 'Dismiss', {
              duration: 3000,
            });
          },
        });
    }
  }

  //load images initially when the component is loaded
  ngOnInit(): void {
    this.getImages(this.pageNumber);
  }

  //check if the user is scrolling down,once reached bottom fetch more data
  ngAfterViewInit(): void {
    timer(5000).subscribe(() => {
      this.scroller
        .elementScrolled()
        .pipe(
          map(() => this.scroller.measureScrollOffset('bottom')),
          pairwise(),
          filter(([y1, y2]) => {
            return y2 < y1 && y2 < 120;
          }),
          throttleTime(200)
        )
        .subscribe(() => {
          this.ngZone.run(() => {
            console.log('fetching');
            this.fetchMore();
          });
        });
    });
  }

  //remove the swiped image details from local storage using the image id.
  drop(event: CdkDragDrop<Photos[]>) {
    const currentIndex = event.currentIndex;
    const currentValue = this.imageList$.value;
    const itemData = event.item.data.id;
    console.log(itemData);
    if (itemData >= 0) {
      // Delete the item from local storage using the ID
      this.galleryService.deleteFromLocalStorage(itemData);

      // Filter out the item with the matching ID
      const updatedList = currentValue.filter(item => item.id !== itemData);

      // Update the BehaviorSubject with the filtered list
      this.imageList$.next(updatedList);
      this.snackBar.open('Item deleted!!', 'OK', {
        duration: 3000,
      });
    } else {
      console.error('Invalid currentIndex:', currentIndex);
      this.snackBar.open('Unknown Error!!', 'Dismiss', {
        duration: 3000,
      });
    }
  }

  //trackBy function for better performance when dealing with long lists.
  trackByFn(index: number, item: Photos): string {
    return item.id;
  }

  //navigate user to next page when clicked on the list.
  onListItemClick(item: Photos) {
    this._router.navigate(['/details', item.id]);
  }

  //unsubscribe when changing component
  ngOnDestroy(): void {
    if (this.imageSubscription) {
      this.imageSubscription.unsubscribe();
    }
  }
}
