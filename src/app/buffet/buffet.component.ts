import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

import {
  TriangleSlideshowComponent,
  FloatingBlockComponent,
  AnimationIntoDirective,
  Images,
  MakeMetaService,
  LoadingComponent,
  ImageFilterDirective,
} from 'lib';

@Component({
  selector: 'app-buffet',
  imports: [
    RouterModule,
    TriangleSlideshowComponent,
    FloatingBlockComponent,
    AnimationIntoDirective,
    ImageFilterDirective,
    LoadingComponent,
  ],
  templateUrl: './buffet.component.html',
  styleUrl: './buffet.component.scss'
})
export class BuffetComponent {
  loading: boolean = true;
  isBrowser: boolean;

  slides: Images[] = [
    { image: 'images/Buffet/西式Buffet.jpg', title: '西式Buffet', description: '嚴選多國料理精華，帶給您驚艷視覺與味蕾的百匯饗宴。' },
    { image: 'images/Buffet/中式桌菜.jpg', title: '中式桌菜', description: '匯集經典手路菜，澎湃上桌，是您聚會歡慶的最暖心選擇。' },
    { image: 'images/Buffet/巴沙米克鮭魚捲.jpg', title: '巴沙米克鮭魚捲', description: '鮮嫩鮭魚伴隨巴沙米克醋的酸甜，層次豐富、質感優雅。' },
  ];

  gallery: Images[] = [
    { image: 'images/Buffet/西式Buffet.jpg', title: '西式Buffet', description: '嚴選多國料理精華，帶給您驚艷視覺與味蕾的百匯饗宴。' },
    // { image: 'images/Buffet/蒜泥白肉.jpg', title: '蒜泥白肉', description: '彈牙豬五花淋上秘製香醇蒜醬，鹹香入味，讓人食指大動。' },
    // { image: 'images/Buffet/鹹豬肉.jpg', title: '鹹豬肉', description: '經典燻香火候，皮 Q 肉嫩、鹹鮮適口，是下酒的最佳拍檔。' },
    { image: 'images/Buffet/哈密瓜生火腿.jpg', title: '哈密瓜生火腿', description: '鮮甜多汁哈密瓜遇上熟成生火腿，演繹極致的鹹甜完美交織。' },
    // { image: 'images/Buffet/鹹塔派.jpg', title: '鹹塔派', description: '金黃酥脆的手作派皮，包裹濃郁內餡，每一口都是溫潤驚喜。' },
    // { image: 'images/Buffet/烤羊肉法棍.jpg', title: '烤羊肉法棍', description: '香烤嫩羊肉搭配酥香法棍，異國風味在舌尖熱情綻放。' },
    // { image: 'images/Buffet/嫩煎豬法棍.jpg', title: '嫩煎豬法棍', description: '鮮嫩豬肉片佐以特調醬汁，酥脆法棍夾層透出滿滿肉汁。' },
    { image: 'images/Buffet/水果奶酪.jpg', title: '水果奶酪', description: '絲滑醇厚奶酪佐以當季鮮果，為甜點時光畫上清新句點。' },
    { image: 'images/Buffet/巴沙米克鮭魚捲.jpg', title: '巴沙米克鮭魚捲', description: '鮮嫩鮭魚伴隨巴沙米克醋的酸甜，層次豐富、質感優雅。' },
    { image: 'images/Buffet/鯖魚緹花.jpg', title: '鯖魚緹花', description: '匠心雕琢的鯖魚鮮味，口感細膩札實，彷彿海洋藝術品。' },
    { image: 'images/Buffet/義式烤蛋.jpg', title: '義式烤蛋', description: '多種香料與滑嫩蛋香交織，呈現濃郁地中海式的溫暖滋味。' },
    { image: 'images/Buffet/日式叉燒.jpg', title: '日式叉燒', description: '慢火燉滷至入口即化，醬香入骨，是大人小孩都愛的經典。' },
    { image: 'images/Buffet/可頌煎火腿.jpg', title: '可頌煎火腿', description: '酥脆奶香可頌夾入厚實煎火腿，層次感爆發，美味無上限。' },
    { image: 'images/Buffet/煎蛋酥蝦.jpg', title: '煎蛋酥蝦', description: '鮮甜脆蝦覆上金黃蛋酥，多層次脆感在口中舞動。' },
    { image: 'images/Buffet/麻將嫩雞.jpg', title: '麻將嫩雞', description: '濃郁芝麻香氣緊鎖嫩滑雞肉，鹹甜醇厚，回味悠長。' },
    { image: 'images/Buffet/馬芬蛋糕.jpg', title: '馬芬蛋糕', description: '鬆軟綿密的香甜口感，入口即化的幸福滋味，下午茶必備。' },
    { image: 'images/Buffet/培根奶油義大利麵.jpg', title: '培根奶油義大利麵', description: '經典白醬濃郁順滑，搭配焦香培根，完美吸附每一根麵條。' },
    { image: 'images/Buffet/提拉米蘇櫻桃蛋糕.jpg', title: '提拉米蘇櫻桃蛋糕', description: '濃醇咖啡香與微酸櫻桃的華麗邂逅，堆疊出奢華層次感。' },
    { image: 'images/Buffet/中式桌菜.jpg', title: '中式桌菜', description: '匯集經典手路菜，澎湃上桌，是您聚會歡慶的最暖心選擇。' },
    { image: 'images/Buffet/西式小漢寶.jpg', title: '西式小漢寶', description: '一口特製迷你漢堡，紮實肉排與起司交織，爆發驚艷滋味。' },
    { image: 'images/Buffet/中式排餐.jpg', title: '中式排餐', description: '精選厚切肉質，以中式秘製醬汁文火細烤，盡顯尊榮不凡。' },
    { image: 'images/Buffet/華麗中餐.jpg', title: '華麗中餐', description: '傳統工法與現代創意的華麗邂逅，視覺與味覺的雙重饗宴。' },
    { image: 'images/Buffet/京都排骨.jpg', title: '京都排骨', description: '酸甜適口的特調京都醬汁，緊鎖排骨鮮嫩肉汁，令人食指大動。' },
    { image: 'images/Buffet/舒適宴會空間.jpg', title: '舒適宴會空間', description: '高雅私密的隱密空間，專為 10-25 人聚會打造的尊榮時光。' },
    { image: 'images/Buffet/醬燒雞腿.jpg', title: '醬燒雞腿', description: '鮮嫩雞腿肉裹上濃郁金黃醬汁，外皮微焦香脆，肉質軟嫩多汁。' },
  ]

  constructor(
    private route: ActivatedRoute,
    private meta: MakeMetaService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {

      this.meta.set(
        "精緻桌菜",
        "台北私廚包場推薦 松山區中西式 Buffet Galaxy House 銀河會所桌菜 商務聚會客製化餐點 南京東路隱密聚餐首選",
        "「Galaxy House 銀河會所」坐落台北松山區，提供極致隱密且高質感的包場聚演空間。無論是澎湃的中式桌菜，或精緻的西式 Buffet 百匯，我們皆能依據預算為 10 至 25 人的團體客製 5 至 10 道以上的星級料理，並額外贈送季節水果盤。專為商務宴客、慶生及家族私人聚會打造，搭配優雅裝潢與頂級酒水服務，讓每一場饗宴都成為難忘的經典回憶。請提前 20 日預訂，開啟您的專屬私人食光。",
        "https://meee.com.tw/hcoGiC8.jpg"
      );


    this.loading = false;
  }
}

