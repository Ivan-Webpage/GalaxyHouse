import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, ViewChild, ViewContainerRef, ComponentRef, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import {
  TriangleSlideshowComponent,
  ContentService,
  MakeMetaService,
  Images,
  CardComponent,
  ArticleSimple,
  LoadingComponent,
  DestroyService
 } from 'lib';
import { RouterModule, ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-news',
  imports: [
    RouterModule,
    CommonModule,
    TriangleSlideshowComponent,
    CardComponent,
    LoadingComponent
  ],
  templateUrl: './news.component.html',
  styleUrl: './news.component.scss',
  providers: [DestroyService]
})
export class NewsComponent implements OnInit, OnDestroy {
  slides: Images[] = [
    { image: 'images/16比9/在台北市中心有露營的體驗16_9.jpg', title: '台北市中心有露營的體驗', description: 'Galaxy House 銀河會所 台北市中心露營體驗，高端都會休閒氛圍' },
    { image: 'images/16比9/松餐店一樓16_9.jpg', title: '松餐店一樓', description: 'Galaxy House 銀河會所 松山店一樓入口與用餐空間，高端會所氛圍' },
    { image: 'images/16比9/歐式古典雪茄空間16_9.jpg', title: '歐式古典雪茄空間', description: 'Galaxy House 銀河會所 歐式古典雪茄空間，典雅高端私密會所' }
  ];

  newType: string = "";
  news: ArticleSimple[] = [];
  loading: boolean = true;
  isBrowser: boolean;
  @ViewChild('calendarHost', { read: ViewContainerRef, static: false }) calendarHost?: ViewContainerRef;
  private calendarComponentRef?: ComponentRef<any>;
  private calendarLoaded: boolean = false;

  constructor(
    private meta: MakeMetaService,
    private route: ActivatedRoute,
    private router: Router,
    private content: ContentService,
    private destroy$: DestroyService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.meta.set(
      "最新消息",
      "最新消息 品牌動態 活動公告 餐飲新品 會員優惠",
      "Galaxy House 銀河會所最新消息，提供品牌活動、餐飲新品、商務聚會與會員專屬優惠資訊。掌握台北松山與天母店的第一手動態。",
      "images/天母店場景/天母店門口.jpg"
    );

    // 取得路由參數
    this.newType = this.route.snapshot.paramMap.get('newType') || "";
    const branchShop = this.route.snapshot.paramMap.get('branchShop') || "";

    this.content.getArticlesByNewsType(this.newType, branchShop).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (articles) => {
        this.news = articles;
        this.loading = false;
        if (this.isBrowser) {
          this.reloadOnNextNavigation();
        }
        // If the page should show the calendar, lazy-load it now (browser only)
        if (this.isBrowser && this.newType === 'newActivity') {
          this.loadCalendar();
        }
      },
      error: (error) => {
        console.error('Error fetching news data', error);
        this.loading = false;
      }
    });
  }

  // 換頁刷新（沿用原 ApiService.reload 的行為）
  private reloadOnNextNavigation(): void {
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        window.location.reload();
      }
    });
  }

  async loadCalendar(): Promise<void> {
    if (!this.calendarHost || this.calendarLoaded || !this.isBrowser) return;
    try {
      const m = await import('lib');
      const CalendarComponent = (m as any).CalendarComponent;
      if (!CalendarComponent) return;
      this.calendarComponentRef = this.calendarHost.createComponent(CalendarComponent as any);
      if (this.calendarComponentRef && this.calendarComponentRef.instance) {
        // pass inputs
        this.calendarComponentRef.instance.news = this.news;
      }
      this.calendarLoaded = true;
      this.cdr.detectChanges();
    } catch (err) {
      console.error('Failed to load CalendarComponent dynamically', err);
    }
  }

  ngOnDestroy(): void {
    // DestroyService 會自動清理訂閱
    if (this.calendarComponentRef) {
      try { this.calendarComponentRef.destroy(); } catch {}
    }
  }
}

