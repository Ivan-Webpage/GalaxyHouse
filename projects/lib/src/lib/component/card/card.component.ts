import { Component, Input } from '@angular/core';
import { ImageFilterDirective, ArticleSimple } from 'lib';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'lib-card',
  imports: [RouterModule, ImageFilterDirective],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
})
export class CardComponent {
  @Input() info: ArticleSimple = {
    id: 1,
    image: 'images/16比9/天母店雪茄室16_9.jpg',
    title: '銀河快報',
    newType: {
      title: '最新消息',
      color: '#efd07f'
    },
    expiration_date: '2024-1-12',
    create_date: '2024-1-12',
    description: '經過上述討論，我們一般認為，抓住了問題的關鍵，其他一切則會迎刃而解。叔本華曾經說過這麼一句話，沒有失敗這回事。這句話語雖然很短，但令我浮想聯翩...'
  };


  hover = false; // 是否滑鼠在卡片上
  sparks: Array<{ left: string; delay: string; size: string; duration: string; hue: number }> = [];
  sparkCount = 60;

  onMouseEnter() {
    this.hover = true;
    // 進入時生成 spark
    this.sparks = [];
    for (let i = 0; i < this.sparkCount; i++) {
      const left = (Math.random() * 100).toFixed(2) + '%';
      const delay = (Math.random() * 1.5).toFixed(2) + 's';
      const size = (Math.random() * 4 + 2).toFixed(2) + 'px';
      const duration = (Math.random() * 1 + 1).toFixed(2) + 's';
      const hue = Math.floor(30 + Math.random() * 40);
      this.sparks.push({ left, delay, size, duration, hue });
    }
  }

  onMouseLeave() {
    this.hover = false;
    this.sparks = []
  }
}
