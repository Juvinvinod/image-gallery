import {
  AfterViewInit,
  Component,
  NgZone,
  OnInit,
  ViewChild,
} from '@angular/core';
import { GalleryService } from '../gallery.service';
import { Photos } from '../photos';
import { BreakpointObserver } from '@angular/cdk/layout';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import {
  BehaviorSubject,
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
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild(CdkVirtualScrollViewport) scroller!: CdkVirtualScrollViewport;
  loading = false;
  pageNumber = 1;
  displayType!: string;
  isLargeScreen!: boolean;

  // Declare imageList$ as a BehaviorSubject
  imageList$: BehaviorSubject<Photos[]> = new BehaviorSubject<Photos[]>([]);

  constructor(
    private galleryService: GalleryService,
    private breakpointObserver: BreakpointObserver,
    private ngZone: NgZone,
    private _router: Router,
    private snackBar: MatSnackBar
  ) {}

  getGridCols(): number {
    return this.breakpointObserver.isMatched('(max-width: 1024px)') ? 1 : 3;
  }

  onViewTypeChange(viewType: string) {
    this.displayType = viewType;
  }

  fetchMore() {
    this.loading = true;
    this.pageNumber++;
    this.getImages(this.pageNumber);
  }

  getImages(pageNumber: number): void {
    const localItem = this.galleryService.getFromLocalStorage(pageNumber);
    if (localItem?.length !== 0) {
      this.imageList$.next([...this.imageList$.value, ...localItem]);
      console.log(this.imageList$.value);
      this.loading = true;
    } else {
      this.galleryService.getDataFromApi(pageNumber).subscribe({
        next: res => {
          this.imageList$.next([...this.imageList$.value, ...res]);
          this.galleryService.saveToLocalStorage(res);
          this.loading = true;
        },
      });
    }
  }

  ngOnInit(): void {
    this.getImages(this.pageNumber);
  }

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
      console.log(updatedList);
      this.snackBar.open('Item deleted!!', 'OK', {
        duration: 3000,
      });
    } else {
      console.error('Invalid currentIndex:', currentIndex);
    }
  }

  trackByFn(index: number, item: Photos): string {
    return item.id;
  }

  onListItemClick(item: Photos) {
    // Assuming item.id contains the ID needed for navigation
    this._router.navigate(['/details', item.id]);
  }
}
