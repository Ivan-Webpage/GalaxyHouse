import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  MakeMetaService,
  TriangleSlideshowComponent,
  CollapsibleComponent,
  ContentService,
  Images,
  ApplyGroup,
  LoadingComponent,
  DestroyService
} from 'lib';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-apply',
  imports: [TriangleSlideshowComponent, CollapsibleComponent, LoadingComponent],
  templateUrl: './apply.component.html',
  styleUrl: './apply.component.scss',
  providers: [DestroyService]
})
export class ApplyComponent implements OnInit, OnDestroy {
  slides: Images[] = [
    { image: 'images/16比9/在台北市中心有露營的體驗16_9.jpg', title:'台北市中心有露營的體驗', description:'Galaxy House 銀河會所 台北市中心露營體驗，高端都會休閒氛圍' },
    { image: 'images/16比9/松餐店一樓16_9.jpg', title:'松餐店一樓', description:'Galaxy House 銀河會所 松山店一樓入口與用餐空間，高端會所氛圍' },
    { image: 'images/16比9/歐式古典雪茄空間16_9.jpg', title:'歐式古典雪茄空間', description:'Galaxy House 銀河會所 歐式古典雪茄空間，典雅高端私密會所' }
  ];

  applyData: ApplyGroup[] = [];
  loading: boolean = true;
  isBrowser: boolean;

  constructor(
    private content: ContentService,
    private meta: MakeMetaService,
    private destroy$: DestroyService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.meta.set(
      "企業徵才",
      "高端餐飲 服務 管理職缺",
      "加入 Galaxy House 銀河會所，成為高端餐飲與尊榮會所服務團隊的一員。我們提供專業培訓、優渥福利與多元發展，誠摯邀請熱愛服務的你一同打造頂級體驗。",
      "https://meee.com.tw/W4Xs8vA.jpg"
    );

    this.content.getApplyClassification().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (groups) => {
        this.applyData = groups;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching apply data', error);
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    // DestroyService 會自動清理訂閱
  }
}