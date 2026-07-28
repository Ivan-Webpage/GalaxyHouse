import { Component, OnInit, OnDestroy } from '@angular/core';
import { TriangleSlideshowComponent, ImageFilterDirective, AnimationIntoDirective, MakeMetaService, Images, DestroyService } from 'lib';

@Component({
  selector: 'app-about-us',
  imports: [TriangleSlideshowComponent, ImageFilterDirective, AnimationIntoDirective],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.scss',
  providers: [DestroyService]
})
export class AboutUsComponent implements OnInit, OnDestroy {
  slides: Images[] = [
    { image: 'images/16比9/在台北市中心有露營的體驗16_9.jpg', title:'台北市中心有露營的體驗', description:'Galaxy House 銀河會所 台北市中心露營體驗，高端都會休閒氛圍' },
    { image: 'images/16比9/松餐店一樓16_9.jpg', title:'松餐店一樓', description:'Galaxy House 銀河會所 松山店一樓入口與用餐空間，高端會所氛圍' },
    { image: 'images/16比9/歐式古典雪茄空間16_9.jpg', title:'歐式古典雪茄空間', description:'Galaxy House 銀河會所 歐式古典雪茄空間，典雅高端私密會所' }
  ];
  
  timelineData = [
    { date: '2021-03-01', title:"GALAXY CAFE誕生", description: '從一間咖啡店的創立，想要去服務更多的粉絲，給喜歡交流的你，打造一個舒適的交流空間' },
    { date: '2024-05-30', title:"天母店升級為GALAXY HOUSE", description: '我們發現，高品味的舒適體驗，並不需要昂貴的金額，所以我們想要升級我們的交流空間，讓「會所」不再是平凡人們卻步的空間' },
    { date: '2024-11-30', title:"GALAXY HOUSE 松山店開幕", description: '一個莫大的榮幸，GALAXY HOUSE走向了集團化經營，第一家分店坐落在台北市一級戰區，向世界宣告GALAXY HOUSE已經茁壯' },
  ];

  isContentVisible: boolean[] = this.timelineData.map(() => false);

  constructor(private meta: MakeMetaService, private destroy$: DestroyService) { }

  ngOnInit(): void {
    this.meta.set(
      "關於我們", 
      "高端餐飲 會所體驗 尊榮體驗", 
      "認識 Galaxy House 銀河會所，我們結合高端餐飲、酒水體驗與私人包廂，打造專屬的尊榮會所氛圍，成為商務聚會與私人交流的首選空間。", 
      "https://meee.com.tw/Rd6Ds4S.jpg"
    );
  }

  toggleContent(index: number): void {
    this.isContentVisible[index] = !this.isContentVisible[index];
  }

  ngOnDestroy(): void {
    // DestroyService 會自動清理訂閱
  }

  getDirection(index: number): string {
    // 偶数索引左对齐，奇数索引右对齐
    return index % 2 === 0 ? 'left' : 'right';
  }
}
