import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MakeMetaService } from 'lib';

interface GalleryItem {
  src: string;
  tag: string;
  caption: string;
  alt: string;
}

interface ExperienceItem {
  no: string;
  tag: string;
  title: string;
  desc: string;
  note: string;
  wide?: boolean;
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

  experiences: ExperienceItem[] = [
    { no: '01', tag: '極致炭烤', title: '特色烤肉餐車 ‧ 戶外炙烤熱饗', desc: '頂級海陸串燒現烤出爐，大蝦、鮮貝生蠔、特調香料肉串與烤時蔬，搭配主廚炭火特調醬汁，香氣四溢熱烈供應。', note: '✦ 產地海鮮 ‧ 現烤串物' },
    { no: '02', tag: '調酒饗宴', title: '星級調酒 ‧ 特選微醺之夜', desc: '現場設置型男調酒師吧台，親自調配琴通寧、水果沙瓦、特調雞尾酒，並精選歐洲原裝紅白酒、西班牙桑格利亞水果酒。', note: '✦ 紅白酒 ‧ 雞尾酒暢酩' },
    { no: '03', tag: '雪茄威士忌', title: '現場雪茄 ╳ 珍稀威士忌', desc: '專為愛好者備妥限量頂級手工雪茄與珍稀單一麥芽威士忌，供貴賓現場品鑑選購，享受專屬私密的煙草沉醉醇厚時光。', note: '✦ 現場提供鑑賞與選購' },
    { no: '04', tag: '古典樂饗', title: '古典弦樂 ‧ 優雅室內樂合奏', desc: '特聘專業樂手現場演繹悠揚古典與現代跨界曲目，以絲竹之美營造高端歐洲貴族沙龍般的社交氛圍。', note: '✦ 沉浸式沙龍音樂饗宴' },
    { no: '05', tag: '現場演出', title: '實力歌手現場演唱 ‧ 點亮星夜高潮', desc: '夜幕低垂之時，邀請知名實力歌手登台，用迷人深情的磁性嗓音帶來靈魂流行與爵士金曲，將週年慶狂歡氛圍推向最高峰。', note: '✦ 爵士靈魂 ‧ 經典熱唱', wide: true },
  ];

  gallery: GalleryItem[] = [
    { src: 'images/uploads/anniversary/海鮮炭烤拼盤.jpg', tag: '海鮮拼盤', caption: '現烤大蝦、鮮干貝與時令海味百匯', alt: '海鮮冷盤與現烤生蠔蝦貝' },
    { src: 'images/uploads/anniversary/烤滷豬.jpg', tag: '烤滷豬', caption: '秘製烤滷豬料理', alt: '秘製烤滷豬料理' },
    { src: 'images/uploads/anniversary/調酒師特調演繹.jpg', tag: '調酒特寫', caption: '微醺律動的夜間特調', alt: '專注傾注美酒的調酒師' },
    { src: 'images/uploads/anniversary/吧台社交時光.jpg', tag: '會所社交', caption: '名流匯聚的社交沙龍', alt: '會所吧台貴賓歡聚' },
    { src: 'images/uploads/anniversary/當晚特調酒單.jpg', tag: '精選酒單', caption: '伏特加、琴酒、蘭姆與威士忌系列', alt: '當晚專屬酒單與現場調酒吧台' },
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
      'Galaxy House 銀河會所天母館與松山館首度聯合舉辦歲末週年慶盛典，2026/12/05 傍晚登場。現烤海陸百匯、星級調酒、雪茄威士忌、古典弦樂與歌手現場演唱，正式會員免費攜伴一位女伴出席，名額僅限 100～140 位，即刻線上響應出席。',
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
