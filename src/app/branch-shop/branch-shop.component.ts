import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, ViewChild, ViewContainerRef, ComponentRef, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFacebookF, faInstagram, faMedium, faLine } from "@fortawesome/free-brands-svg-icons";
import { RouterModule } from '@angular/router';

import {
  ContentService,
  BranchData,
  ReservationBlock,
  TriangleSlideshowComponent,
  FloatingBlockComponent,
  AnimationIntoDirective,
  Images,
  MakeMetaService,
  LoadingComponent,
  DestroyService
} from 'lib';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-branch-shop',
  imports: [
    RouterModule, 
    TriangleSlideshowComponent, 
    FloatingBlockComponent, 
    FontAwesomeModule, 
    AnimationIntoDirective,
    LoadingComponent
  ],
  templateUrl: './branch-shop.component.html',
  styleUrl: './branch-shop.component.scss',
  providers: [DestroyService]
})
export class BranchShopComponent implements OnInit, OnDestroy {
  faFacebookF = faFacebookF;
  faInstagram = faInstagram;
  faMedium = faMedium;
  faLine = faLine;

  branchData: (Omit<BranchData, 'shop'> & { shop: Omit<BranchData['shop'], 'googleMapUrl'> & { googleMapUrl: string | SafeResourceUrl } }) | null = null;
  loading: boolean = true;
  isBrowser: boolean;
  reservations: ReservationBlock[] = [];
  @ViewChild('reservationHost', { read: ViewContainerRef, static: false }) reservationHost?: ViewContainerRef;
  private reservationComponentRef?: ComponentRef<any>;
  private reservationCalendarLoaded: boolean = false;
  private reservationCalendarLoading: boolean = false;

  slides: Images[] = [
    { image: 'images/16比9/在台北市中心有露營的體驗16_9.jpg', title: '台北市中心有露營的體驗', description: 'Galaxy House 銀河會所 台北市中心露營體驗，高端都會休閒氛圍' },
    { image: 'images/16比9/松餐店一樓16_9.jpg', title: '松餐店一樓', description: 'Galaxy House 銀河會所 松山店一樓入口與用餐空間，高端會所氛圍' },
    { image: 'images/16比9/歐式古典雪茄空間16_9.jpg', title: '歐式古典雪茄空間', description: 'Galaxy House 銀河會所 歐式古典雪茄空間，典雅高端私密會所' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
    private content: ContentService,
    private meta: MakeMetaService,
    private destroy$: DestroyService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    const shopId = this.route.snapshot.paramMap.get('id') || "";

    if (shopId === "Songshan") {
      this.meta.set(
        "松山店",
        "雪茄交流會 餐酒 桌菜 Buffet 商務會所",
        "Galaxy House 銀河會所 松山店，位於台北松山區，提供高端餐飲、酒水、商業空間與私人包廂。適合聚會、會議與尊榮社交，打造專屬您的私密體驗。",
        "https://meee.com.tw/hcoGiC8.jpg"
      );
    } else if (shopId === "Tianmu") {
      this.meta.set(
        "天母店",
        "雪茄交流會 餐酒 火鍋 商務會所",
        "Galaxy House 銀河會所 天母店，坐落於台北天母，擁有空中花園、私人包廂與高端餐飲酒水。適合商務聚會、私人派對與尊榮社交體驗。",
        "https://meee.com.tw/hcoGiC8.jpg"
      );
    }

    this.content.getBranchShop(shopId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.branchData = data ? { ...data, shop: { ...data.shop } } : null;

        if (this.isBrowser && this.branchData?.shop?.googleMapUrl && typeof this.branchData.shop.googleMapUrl === 'string') {
          this.branchData.shop.googleMapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.branchData.shop.googleMapUrl);
        }

        this.loading = false;
        if (this.isBrowser) {
          this.reloadOnNextNavigation();
          // 手動跑一次 CD，讓 @if (branchData) 區塊裡的 reservationHost 容器先掛上去，
          // ViewChild 才會有值（否則這個 subscribe callback 執行時 view 還沒更新）。
          this.cdr.detectChanges();
          this.renderReservationCalendar();
        }
      },
      error: (err) => {
        console.error('Error fetching branch shop data', err);
        this.loading = false;
      }
    });

    this.content.getReservations(shopId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (reservations) => {
        this.reservations = reservations;
        if (this.isBrowser) {
          this.renderReservationCalendar();
        }
      },
      error: (err) => console.error('Error fetching reservation data', err)
    });
  }

  // branchData 與 reservations 是兩個獨立的非同步請求，哪個先回來就先嘗試 render 一次：
  // 已建立過元件就只更新 input，容器（在 @if (branchData) 區塊內）還沒存在就等下一次資料到達再試。
  private renderReservationCalendar(): void {
    if (!this.isBrowser) return;
    if (this.reservationComponentRef) {
      this.reservationComponentRef.setInput('reservations', this.reservations);
      return;
    }
    this.loadReservationCalendar();
  }

  private async loadReservationCalendar(): Promise<void> {
    if (!this.reservationHost || this.reservationCalendarLoaded || this.reservationCalendarLoading) return;
    this.reservationCalendarLoading = true;
    try {
      const m = await import('lib');
      const ReservationCalendarComponent = (m as any).ReservationCalendarComponent;
      if (!ReservationCalendarComponent) return;
      this.reservationComponentRef = this.reservationHost.createComponent(ReservationCalendarComponent as any);
      this.reservationComponentRef.setInput('reservations', this.reservations);
      this.reservationCalendarLoaded = true;
      this.cdr.detectChanges();
    } catch (err) {
      console.error('Failed to load ReservationCalendarComponent dynamically', err);
    } finally {
      this.reservationCalendarLoading = false;
    }
  }

  ngOnDestroy(): void {
    // DestroyService 會自動清理訂閱
    if (this.reservationComponentRef) {
      try { this.reservationComponentRef.destroy(); } catch {}
    }
  }

  /** 點擊後開啟與官方 LINE@ 的對話，並帶入預設訂位文字讓客戶直接送出 */
  get lineReservationUrl(): string {
    const lineId = this.branchData?.shop?.lineID;
    if (!lineId) return '';
    return `https://line.me/R/oaMessage/${lineId}/?${encodeURIComponent('您好，我想預約訂位')}`;
  }

  // 換頁刷新（沿用原 ApiService.reload 的行為）
  private reloadOnNextNavigation(): void {
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        window.location.reload();
      }
    });
  }
}
