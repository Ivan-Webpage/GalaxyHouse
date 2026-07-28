import { Component, OnInit, OnDestroy, Input, NgZone, Renderer2, ElementRef, AfterViewInit, Inject, HostListener, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ImageFilterDirective, Images, DestroyService } from 'lib';
import { ChangeDetectorRef } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { interval } from 'rxjs';

@Component({
  selector: 'lib-triangle-slideshow',
  imports: [ImageFilterDirective],
  templateUrl: './triangle-slideshow.component.html',
  styleUrl: './triangle-slideshow.component.css',
  providers: [DestroyService]
})
export class TriangleSlideshowComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() showArrow: boolean = true;
  @Input() showIntroduce: boolean = true;
  @Input() introduceTitle: string = "請輸入標題";
  @Input() introduceContent: string = "一般來講，我們都必須務必慎重的考慮考慮。你真的了解學而時習之嗎？了解清楚學而時習之到底是一種怎麽樣的存在，是解決一切問題的關鍵。既然如此，在這種困難的抉擇下，本人思來想去，寢食難安。學而時習之的發生，到底需要如何做到，不學而時習之的發生，又會如何產生。而這些並不是完全重要，更加重要的問題是，我們不得不面對一個非常尷尬的事實，那就是";
  @Input() logoSize: number = 100;
  @Input() height: string = '100vh';
  @Input() filterColer: string = "rgba(27,27,27,0.5)";
  @Input() ballColor: string = "rgba(239, 208, 127)";
  @Input() geometryColor: string = "rgba(255, 255, 255)";
  @Input() slides: Images[] = [
    { image: 'images/hero_0.jpg', title: '圖片介紹', description: "" },
    { image: 'images/hero_1.jpg', title: '圖片介紹', description: "" },
    { image: 'images/hero_2.jpg', title: '圖片介紹', description: "" }
  ];

  logoResize: number = this.logoSize;
  buttonPositions: { x: number, y: number }[] = [];
  ballPosition: { x: number, y: number } = { x: 0, y: 0 };

  currentSlide = 0;
  prevSlide = 0;
  nextSlide = 1;
  private isBrowser: boolean;

  constructor(
    private ngZone: NgZone,
    private destroy$: DestroyService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      const canvas = document.getElementById('polygonCanvas') as HTMLCanvasElement;
      if (canvas) {
        this.changeLogoSize(window.innerWidth);
        this.drowInit();
        this.cdr.detectChanges();
      }
    }
  }

  ngOnDestroy(): void {
    // DestroyService 會自動清理訂閱
  }

  @HostListener('window:resize')
  onResize(): void {
    if (this.isBrowser) {
      this.changeLogoSize(window.innerWidth);
      this.drowInit();
    }
  }

  changeLogoSize(windowsSize: number): void {
    if (this.isBrowser) {
      this.logoResize = windowsSize <= 768 ? this.logoSize / 2 : this.logoSize;
    }
  }

  drowInit(): void {
    this.drawPolygon(this.slides.length, this.logoResize + 50, this.geometryColor, 1);
    this.autoChangeSlide();
    this.updateBallPosition();
  }

  toSlide(target: number): void {
    if (this.currentSlide === target) {
      return;
    }
    let direction: number;
    if (this.currentSlide > target) {
      direction = target - this.currentSlide + this.slides.length;
    } else {
      direction = target - this.currentSlide
    }
    this.changeSlide(direction)

  }

  // 切換上or下幻燈片
  changeSlide(direction: number): void {
    // 存儲當前索引
    this.prevSlide = this.currentSlide;

    // 根據方向更新當前幻燈片索引
    this.currentSlide += direction;

    if (this.currentSlide < 0) {
      this.currentSlide = this.slides.length - 1; // 從最後一張回到第一張
    } else if (this.currentSlide >= this.slides.length) {
      this.currentSlide = 0; // 從第一張回到最後一張
    }

    // 更新下一張幻燈片
    this.nextSlide = (this.currentSlide + 1) % this.slides.length;

    // 更新圓圈位置
    this.updateBallPosition();
  }

  autoChangeSlide(): void {
    if (!this.isBrowser) return;
    
    this.ngZone.runOutsideAngular(() => {
      interval(5000).pipe(
        takeUntil(this.destroy$)
      ).subscribe(() => {
        this.ngZone.run(() => {
          this.changeSlide(1);
        });
      });
    });
  }

  // 繪製幾何圖形
  drawPolygon(sides: number, radius: number, color: string, lineWidth: number): void {
    const canvas = <HTMLCanvasElement>document.getElementById('polygonCanvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 计算中心点
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // 计算每个顶点的角度
    const angleStep = 2 * Math.PI / sides;

    // 计算旋转角度，确保最下面的边与水平线平行
    const rotationAngle = Math.PI / 2 - (Math.PI / sides);

    //---- 绘制顶点圆圈（按钮）
    // 保存按钮位置
    this.buttonPositions = [];

    // 计算每个按钮的位置并绘制
    for (let i = 0; i < sides; i++) {
      // 计算当前按钮的角度并应用旋转角度
      const angle = i * angleStep + rotationAngle;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      this.buttonPositions.push({ x, y });

      // 設定按鈕位置
      const ball_button = <HTMLCanvasElement>document.getElementById('button_' + i);
      ball_button.style.left = `${x - 20}px`;
      ball_button.style.top = `${y - 20}px`;
      ball_button.style.backgroundColor = color;
    }

    //---- 绘制几何图形
    // 保存当前的画布状态（比如当前的旋转角度）
    ctx.save();

    // 将画布的原点移动到中心点
    ctx.translate(centerX, centerY);

    // 旋转画布，自动调整旋转角度
    ctx.rotate(rotationAngle);

    // 开始绘制
    ctx.beginPath();

    // 计算第一个点的坐标并移动到这个位置
    const startX = radius * Math.cos(0);
    const startY = radius * Math.sin(0);
    ctx.moveTo(startX, startY);

    // 绘制每个顶点
    for (let i = 1; i < sides; i++) {
      const angle = i * angleStep;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      ctx.lineTo(x, y);
    }

    // 连接最后一个点到第一个点，形成闭合的多边形
    ctx.closePath();

    // 设置线条的颜色和粗细
    ctx.strokeStyle = color;  // 设置边框颜色
    ctx.lineWidth = lineWidth;  // 设置线条宽度
    ctx.stroke();  // 绘制边框

    // 设置空心填充颜色，如果需要填充
    ctx.fillStyle = 'transparent';  // 空心效果
    ctx.fill();

    // 恢复画布状态（旋转回原状态）
    ctx.restore();
  }

  // 更新黃色圓圈的位置
  updateBallPosition(): void {
    const ball = document.getElementById('ball');
    const buttonPosition = this.buttonPositions[this.currentSlide];
    if (ball && buttonPosition) {
      ball.style.left = `${buttonPosition.x - 20}px`;  // 因為按鈕半徑為20px，調整為圓心對齊
      ball.style.top = `${buttonPosition.y - 20}px`;
    }
  }

}