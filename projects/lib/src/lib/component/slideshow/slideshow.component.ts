import { Component, OnInit, OnDestroy, NgZone, Input, Inject, HostListener, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ArticleSimple, CardComponent, DestroyService } from 'lib';
import { RouterModule } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { interval } from 'rxjs';

@Component({
  selector: 'lib-slideshow',
  imports: [RouterModule, CardComponent],
  templateUrl: './slideshow.component.html',
  styleUrl: './slideshow.component.scss',
  providers: [DestroyService]
})
export class SlideshowComponent implements OnInit, OnDestroy {
  @Input() slides: ArticleSimple[] = [{
    id: 1,
    image: 'images/16比9/天母店雪茄室16_9.jpg', 
    title: '銀河快報',
    newType: {
      title: '最新消息',
      color: '#efd07f'
    },
    expiration_date: '2024-1-12',
    create_date: '2024-1-12',
    description: '經過上述討論，我們一般認為，抓住了問題的關鍵，其他一切則會迎刃而解。叔本華曾經說過這麼一句話，沒有失敗這回事。這句話語雖然很短，但令我浮想聯翩...'
  }];

  currentSlide = 0;
  prevSlide = -1;
  nextSlide = 1;
  groupedSlides: ArticleSimple[][] = [];
  cardContainerClass: string = '';
  private isBrowser: boolean;

  constructor(
    private ngZone: NgZone,
    private destroy$: DestroyService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.onResize();
      this.autoChangeSlide();
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (this.isBrowser) {
      if (window.innerWidth < 560) {
        this.groupSlides(1);
        this.cardContainerClass = 'col-12';
        return;
      }
      if (window.innerWidth > 768) {
        this.groupSlides(4);
        this.cardContainerClass = 'col-3';
        return;
      }

      this.groupSlides(2);
      this.cardContainerClass = 'col-6';
    }
  }

  groupSlides(step: number): void {
    if (this.slides?.length) {
      const totalSlides = this.slides.length;
      this.groupedSlides = [];
      for (let i = 0; i < totalSlides; i += step) {
        this.groupedSlides.push(this.slides.slice(i, i + step));
      }
    }
  }

  changeSlide(direction: number): void {
    this.prevSlide = this.currentSlide;
    this.currentSlide += direction;

    if (this.currentSlide < 0) {
      this.currentSlide = this.groupedSlides.length - 1;
    } else if (this.currentSlide >= this.groupedSlides.length) {
      this.currentSlide = 0;
    }

    this.nextSlide = (this.currentSlide + 1) % this.groupedSlides.length;
  }

  autoChangeSlide(): void {
    if (!this.isBrowser) return;
    
    this.ngZone.runOutsideAngular(() => {
      interval(5000).pipe(
        takeUntil(this.destroy$)
      ).subscribe(() => {
        this.ngZone.run(() => {
          this.changeSlide(1);
        });
      });
    });
  }

  ngOnDestroy(): void {
    // DestroyService 會自動清理訂閱
  }
}