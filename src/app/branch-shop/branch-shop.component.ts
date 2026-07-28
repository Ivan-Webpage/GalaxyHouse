import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFacebookF, faInstagram, faMedium, faLine } from "@fortawesome/free-brands-svg-icons";
import { RouterModule } from '@angular/router';

import {
  ContentService,
  BranchData,
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
        }
      },
      error: (err) => {
        console.error('Error fetching branch shop data', err);
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    // DestroyService 會自動清理訂閱
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
