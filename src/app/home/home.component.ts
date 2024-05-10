import {
  AfterViewInit,
  ChangeDetectorRef,
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
  Observable,
  filter,
  map,
  pairwise,
  throttleTime,
  timer,
} from 'rxjs';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

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
    private cdr: ChangeDetectorRef
  ) {}

  getGridCols(): number {
    return this.breakpointObserver.isMatched('(max-width: 1024px)') ? 1 : 3;
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

  drop(event: CdkDragDrop<Photos, Photos>) {
    console.log(event);
    const item = this.imageList$.value[event.currentIndex];
    this.galleryService.deleteFromLocalStorage(item.id);
    const updatedList = this.imageList$.value.filter(
      (_, index) => index !== event.currentIndex
    );
    this.imageList$.next(updatedList);
    console.log(updatedList);
  }

  trackByFn(index: number, item: Photos): string {
    return item.id;
  }
}
