import { Component} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent, FooterComponent, MenuItem } from 'lib';

@Component({
  selector: 'app-root',
  imports: [ RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  // 外型設定
  navbarBackbroundColor = "rgba(27,27,27)" // 背景色
  navbarTextColor = "rgba(218,162,27)" // 文字顏色
  dropdownBackbroundColor = "rgba(27,27,27,0.9)" // 下拉選單 背景色
  dropdownTextColor = "rgba(255,255,255)" // 下拉選單 文字顏色

  subCategoryImg = "" // 下拉選單 子項目 圖片
  subCategoryImgAlt = "" // 下拉選單 子項目 圖片 介紹
  title = "Galaxy House 銀河會所";
  titleImage = "images/logo.png";
  menuData: MenuItem[] = [{
    "title": "據點資訊",
    "subMenu": [
      {
        "category": "北區",
        "subCategory": [{
          "title": "天母店",
          "link": "/branchShop/Tianmu",
          "hero": "images/天母店場景/天母店雪茄室.jpg"
        }, {
          "title": "松山店",
          "link": "/branchShop/Songshan",
          "hero": "images/松山店場景/松山店門口.jpg"
        }]
      }
    ]
  },
   {
    "title": "最新消息",
    "subMenu": [
      {
        "category": "公告",
        "subCategory": [{
          "title": "全部",
          "link": "/news/announcement/galaxyhouse",
          "hero": "images/Logo彩色_有文字.jpg"
        }, {
          "title": "天母店",
          "link": "/news/announcement/Tianmu",
          "hero": "images/天母店場景/天母店雪茄室2.jpg"
        }, {
          "title": "松山店",
          "link": "/news/announcement/Songshan",
          "hero": "images/松山店場景/松餐店一樓.jpg"
        }]
      }, {
        "category": "最新活動",
        "subCategory": [{
          "title": "全部",
          "link": "/news/newActivity/galaxyhouse",
          "hero": "images/Logo彩色_有文字.jpg"
        }, {
          "title": "天母店",
          "link": "/news/newActivity/Tianmu",
          "hero": "images/天母店場景/天母店雪茄室2.jpg"
        }, {
          "title": "松山店",
          "link": "/news/newActivity/Songshan",
          "hero": "images/松山店場景/松餐店一樓.jpg"
        }]
      }, {
        "category": "活動花絮",
        "subCategory": [{
          "title": "全部",
          "link": "/news/eventHighlights/galaxyhouse",
          "hero": "images/Logo彩色_有文字.jpg"
        }, {
          "title": "天母店",
          "link": "/news/eventHighlights/Tianmu",
          "hero": "images/天母店場景/天母店雪茄室2.jpg"
        }, {
          "title": "松山店",
          "link": "/news/eventHighlights/Songshan",
          "hero": "images/松山店場景/松餐店一樓.jpg"
        }]
      }
    ]
  },{
    "title": "桌菜&外燴",
    "subMenu": [
      {
        "category": "服務選項",
        "subCategory": [{
          "title": "桌菜",
          "link": "/banquet",
          "hero": "images/Buffet/桌菜.jpg"
        }, {
          "title": "外燴",
          "link": "/catering",
          "hero": "images/外燴/外燴.jpg"
        }]
      }
    ]
  },
   {
    "title": "企業徵才",
    "link": "/apply"
  }, {
    "title": "關於我們",
    "link": "/about_us"
  }]
}

