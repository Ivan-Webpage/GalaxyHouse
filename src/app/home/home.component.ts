import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { faFacebookF, faInstagram, faLine } from "@fortawesome/free-brands-svg-icons";
import { RouterModule } from '@angular/router';
import {
  ContentService,
  TriangleSlideshowComponent,
  SlideshowComponent,
  ImageFilterDirective,
  AnimationIntoDirective,
  Images,
  MakeMetaService,
  ArticleSimple,
  DestroyService
} from 'lib';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  imports: [
    RouterModule,
    FontAwesomeModule, 
    TriangleSlideshowComponent, 
    SlideshowComponent, 
    ImageFilterDirective, 
    AnimationIntoDirective,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [DestroyService]
})
export class HomeComponent implements OnInit, OnDestroy {
  filterColer: string = "rgba(27,27,27,0.5)";
  ballColor: string = "rgba(239, 208, 127)";
  geometryColor: string = "rgba(255, 255, 255)";
  slides: Images[] = [
    { image: 'images/16比9/在台北市中心有露營的體驗16_9.jpg', title:'台北市中心有露營的體驗', description:'Galaxy House 銀河會所 台北市中心露營體驗，高端都會休閒氛圍' },
    { image: 'images/16比9/松餐店一樓16_9.jpg', title:'松餐店一樓', description:'Galaxy House 銀河會所 松山店一樓入口與用餐空間，高端會所氛圍' },
    { image: 'images/16比9/歐式古典雪茄空間16_9.jpg', title:'歐式古典雪茄空間', description:'Galaxy House 銀河會所 歐式古典雪茄空間，典雅高端私密會所' }
  ];

  news: ArticleSimple[] = [];
  isBrowser: boolean;

  faChevronUp = faChevronUp;
  faChevronDown = faChevronDown;
  faLine = faLine;
  faFacebookF = faFacebookF;
  faInstagram = faInstagram;

  constructor(
    private meta: MakeMetaService,
    private content: ContentService,
    private destroy$: DestroyService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.meta.set(
      "首頁",
      "會所體驗 高端餐飲 紅酒威士忌 雪茄文化",
      "Galaxy House 銀河會所位於台北松山，提供高端餐飲、紅酒威士忌與雪茄文化體驗。設有專屬包廂與KTV，適合商務聚會、私人派對與會員專屬活動，打造尊榮私密的社交空間",
      "https://meee.com.tw/s2cGAbF.jpg"
    );

    this.content.getRecentArticles().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (articles) => {
        this.news = articles;
      },
      error: (error) => {
        console.error('Error fetching home news data', error);
      }
    });
  }

  ngOnDestroy(): void {
    // DestroyService 會自動清理訂閱
  }
}