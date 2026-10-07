import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MakeMetaService } from 'lib';

interface GalleryItem {
  src: string;
  tag: string;
  caption: string;
  alt: string;
  title?: string;
  pos?: string;
}

interface ExperienceItem {
  no: string;
  tag: string;
  title: string;
  desc: string;
  note: string;
  wide?: boolean;
  image?: string;
  imagePos?: string;
}

@Component({
  selector: 'app-anniversary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './anniversary.component.html',
  styleUrl: './anniversary.component.scss'
})
export class AnniversaryComponent implements OnInit {
  isBrowser: boolean;

  private readonly LINE_FALLBACK_URL = 'https://line.me/ti/p/@392kgxba';

  venue: GalleryItem = {
    src: 'images/uploads/anniversary/場地夜景.jpg',
    tag: '活動場地',
    title: '星空下的戶外庭園',
    caption: '燈串點亮夜色，庭園草皮、碎石廣場與餐車吧台，打造私享的戶外派對場域。',
    alt: '夜幕下燈串點綴的戶外庭園、餐車吧台與會所建築',
  };

  experiences: ExperienceItem[] = [
    { no: '01', tag: '炭烤串物・極致美味', title: '特色烤肉餐車 ‧ 戶外炙烤熱饗', desc: '海鮮、牛、豬羊、蔬菜串燒美食', note: '火宴晚餐', image: 'images/uploads/anniversary/炭火串烤現場.jpg', imagePos: '50% 40%' },
    { no: '02', tag: '炭火慢烤・酥脆鮮嫩', title: '烤滷豬', desc: '70公斤大烤豬', note: '特製烤肉', image: 'images/uploads/anniversary/烤滷豬.jpg', imagePos: '50% 55%' },
    { no: '03', tag: '專業調酒・微醺時光', title: '現場調酒', desc: '百杯調酒', note: '暢飲', image: 'images/uploads/anniversary/當晚特調酒單.jpg', imagePos: '50% 45%' },
    { no: '04', tag: '鮮果特調・清爽沁涼', title: '雞尾酒 ╳ 茶水', desc: '雞尾酒、水果無酒精飲料、啤酒、茶水', note: '暢飲', image: 'images/uploads/anniversary/雞尾酒.jpg', imagePos: '50% 45%' },
    { no: '05', tag: '沉浸式沙龍・古典饗宴', title: '古典弦樂 ‧ 優雅室內樂合奏', desc: '藝人御用古典樂手', note: '低音大提琴 ｜ 小提琴 ｜ 鍵盤', image: 'images/uploads/anniversary/現場樂手陣容.jpg', imagePos: '50% 45%'  },
    { no: '06', tag: '爵士靈魂・經典熱唱', title: '實力歌手現場演唱 ‧ 點亮星夜高潮', desc: '年輕活力樂團獻唱', note: '鍵盤 王奕凡 ｜ 歌手 貝拉 ｜ 吉他 JAYWU', wide: false, image: 'images/uploads/anniversary/現場演出樂團.jpg', imagePos: '50% 45%'  },
    { no: '07', tag: '幸運時刻・好禮相贈', title: '抽獎', desc: '萬元禮卷', note: '現場購買抽獎禮卷、一張/100元換大獎', wide: false, image: 'images/uploads/anniversary/抽獎.jpg', imagePos: '50% 45%'  },
  ];

  gallery: GalleryItem[] = [
    { src: 'images/uploads/anniversary/烤肉.jpg', tag: '嚴選炙烤串燒', caption: '豐盛的厚切肉串與鮮甜時蔬，在炭火淬鍊下散發迷人脂香，為派對帶來最豪邁的味覺享受。', alt: '豐盛的厚切肉串與鮮甜時蔬，在炭火淬鍊下散發迷人脂香，為派對帶來最豪邁的味覺享受。' },
    { src: 'images/uploads/anniversary/粉紅氣泡酒冰桶.jpg', tag: '沁涼粉紅香檳', caption: '嚴選頂級氣泡酒與香檳於冰桶中絕佳冰鎮。舉杯交錯間，為週年慶典增添浪漫微醺的儀式感。', alt: '嚴選頂級氣泡酒與香檳於冰桶中絕佳冰鎮。舉杯交錯間，為週年慶典增添浪漫微醺的儀式感。' },
    { src: 'images/uploads/anniversary/威士忌.jpg', tag: '頂級酩酒品鑑', caption: '於優雅靜謐的沙龍角落品味珍稀佳釀，為名流貴賓打造極具隱密性與高質感的專屬社交時光。', alt: '於優雅靜謐的沙龍角落品味珍稀佳釀，為名流貴賓打造極具隱密性與高質感的專屬社交時光。' },
    { src: 'images/uploads/anniversary/調酒2.jpg', tag: '絢麗派對特調', caption: '迷幻光影與色彩繽紛的特調雞尾酒相互輝映。多款基酒精心調配，點燃慶典夜晚的狂歡靈魂。', alt: '迷幻光影與色彩繽紛的特調雞尾酒相互輝映。多款基酒精心調配，點燃慶典夜晚的狂歡靈魂。' },
    { src: 'images/uploads/anniversary/冰鎮啤酒.jpg', tag: '暢飲冰鎮啤酒', caption: '派對絕對少不了的暢快滋味！精選知名品牌啤酒沁涼伺候，讓您盡情舉杯，享受不間斷的熱情氛圍。', alt: '派對絕對少不了的暢快滋味！精選知名品牌啤酒沁涼伺候，讓您盡情舉杯，享受不間斷的熱情氛圍。' },
  ];

  showLightbox = false;
  activeImage: GalleryItem | null = null;

  get lineFallbackUrl(): string {
    return this.LINE_FALLBACK_URL;
  }

  constructor(
    private meta: MakeMetaService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.meta.set(
      '雙館週年慶',
      '天母松山銀河會所週年慶 歲末私享盛典 會員攜伴優惠',
      'Galaxy House 銀河會所天母館與松山館首度聯合舉辦歲末週年慶盛典，2026/12/05 傍晚登場。現烤海陸百匯、星級調酒、威士忌、古典弦樂與歌手現場演唱，正式會員免費攜伴一位女伴出席，名額僅限 100～140 位，即刻線上響應出席。',
      'https://thegalaxyhouse.com/images/uploads/anniversary/海鮮炭烤拼盤.jpg'
    );
  }

  openLightbox(item: GalleryItem): void {
    this.activeImage = item;
    this.showLightbox = true;
  }

  closeLightbox(): void {
    this.showLightbox = false;
    this.activeImage = null;
  }

  scrollToRsvp(): void {
    if (!this.isBrowser) return;
    document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
