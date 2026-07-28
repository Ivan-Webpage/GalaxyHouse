import { Directive, ElementRef, HostListener, Input, Renderer2, OnInit, AfterViewInit } from '@angular/core';

@Directive({
  selector: '[libSlipHover]'
})
export class SlipHoverDirective implements OnInit, AfterViewInit {
  @Input() target: string = 'img'; // 默認是 'img'，可以自定義目標元素
  @Input() caption: string = 'title'; // 默認是 'title' 屬性，作為 caption
  @Input() description: string = 'description'; // 默認是 'alt' 屬性，作為 description
  @Input() duration: string = '300ms'; // 動畫時間
  @Input() fontColor: string = '#fff'; // 字體顏色
  @Input() backgroundColor: string = 'rgba(0,0,0,.7)'; // 背景顏色
  @Input() textAlign: string = 'center'; // 文字對齊
  @Input() height: string = '100%'; // 覆蓋層高度
  @Input() verticalMiddle: boolean = true; // 是否垂直置中
  @Input() withLink: boolean = true; // 是否帶鏈接

  private overlay: HTMLElement | null = null;
  private entryDirection: number = 0; // 偵測滑鼠進入方向
  private lastMousePosition: { x: number, y: number } = { x: 0, y: 0 }; // 上一次滑鼠的位置
  private mouseInElement: boolean = false; // 檢查滑鼠是否仍在元素內
  private currentlyHoveredElement: HTMLElement | null = null; // 當前正在顯示 overlay 的元素
  private currentOverlay: HTMLElement | null = null; // 當前的 overlay

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    // 設置元素為容器，這會在元素上設定必要的樣式
    this.renderer.setStyle(this.el.nativeElement, 'position', 'relative');
    this.renderer.setStyle(this.el.nativeElement, 'overflow', 'hidden');
  }

  ngAfterViewInit() {
    // 這裡可以做一些初始化，保證元素已經完全載入
  }

  // 使用 @HostListener 來監聽事件
  @HostListener('mouseenter', ['$event'])
  onMouseEnter(event: MouseEvent) {
    const element = event.target as HTMLElement;

    // 當滑鼠進入新物件時，將舊的物件的 overlay 移除
    if (this.currentlyHoveredElement && this.currentlyHoveredElement !== element) {
      this.onMouseLeave(event);  // 修正這裡，直接傳遞 MouseEvent 物件
    }

    this.mouseInElement = true;

    // 計算進入方向
    this.entryDirection = this.getEntryDirection(event, element);

    // 將 overlay 加入到 el.nativeElement（即 <a> 元素）
    this.overlay = this.createOverlay(element);
    this.renderer.appendChild(element, this.overlay);

    this.currentlyHoveredElement = element;
    this.currentOverlay = this.overlay;

    this.slideIn();
  }

  @HostListener('mouseleave', ['$event'])
  onMouseLeave(event: MouseEvent) {
    this.mouseInElement = false;

    // 如果滑鼠離開的目標是當前的元素，則移除 overlay
    if (this.currentlyHoveredElement) {
      const element = this.currentlyHoveredElement;
      const leaveDirection = this.getLeaveDirection(event, element);

      // 根據離開方向觸發動畫
      this.removeOverlay(leaveDirection);
    }
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    const currentTime = new Date().getTime();
    const deltaTime = currentTime - this.lastMousePosition.x;
    if (deltaTime > 0) {
      // 更新滑鼠位置
      this.lastMousePosition = { x: event.clientX, y: event.clientY };
    }
  }

  private getEntryDirection(event: MouseEvent, element: HTMLElement): number {
    const rect = element.getBoundingClientRect();
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    const horizontalCenter = rect.left + rect.width / 2;
    const verticalCenter = rect.top + rect.height / 2;

    const horizontalDistance = Math.abs(mouseX - horizontalCenter);
    const verticalDistance = Math.abs(mouseY - verticalCenter);

    if (horizontalDistance > verticalDistance) {
      return mouseX < horizontalCenter ? 3 : 1; // 左（3）或 右（1）
    } else {
      return mouseY < verticalCenter ? 0 : 2; // 上（0）或 下（2）
    }
  }

  private createOverlay(element: HTMLElement): HTMLElement {
    const overlay = this.renderer.createElement('div');
    this.renderer.addClass(overlay, 'sliphover-overlay');
    this.renderer.setStyle(overlay, 'position', 'absolute');
    this.renderer.setStyle(overlay, 'align-content', 'center');
    this.renderer.setStyle(overlay, 'top', '0');
    this.renderer.setStyle(overlay, 'left', '0');
    this.renderer.setStyle(overlay, 'width', '100%');
    this.renderer.setStyle(overlay, 'height', '100%');  // 覆蓋整個 <a> 元素
    this.renderer.setStyle(overlay, 'padding', '10px');
    this.renderer.setStyle(overlay, 'background-color', this.backgroundColor);
    this.renderer.setStyle(overlay, 'color', this.fontColor);
    this.renderer.setStyle(overlay, 'text-align', this.textAlign);
    this.renderer.setStyle(overlay, 'z-index', '5'); // 確保 overlay 層在最上層
  
    // 讀取圖片的 title 屬性作為 caption
    const targetElement = element.querySelector(this.target) as HTMLImageElement;
    const overlayH2 = this.renderer.createElement('h2');
    const captionH2 = targetElement ? targetElement.title : '';
    this.renderer.setStyle(overlay, 'letter-spacing', '1.5px');
    this.renderer.setProperty(overlayH2, 'innerHTML', captionH2 || this.caption);

    const overlayP = this.renderer.createElement('p');
    const alt = targetElement ? targetElement.alt : '';
    this.renderer.setStyle(overlay, 'line-height', '1.7');
    this.renderer.setProperty(overlayP, 'innerHTML', alt || this.description);

    overlay.appendChild(overlayH2);
    overlay.appendChild(overlayP);
  
    return overlay;
  }

  private slideIn() {
    if (this.overlay) {
  
      // 設定過渡動畫時間
      this.renderer.setStyle(this.overlay, 'transition', `all ${this.duration}`);
  
      // 根據滑鼠進入方向設置 'top', 'bottom', 'left' 屬性
      if (this.entryDirection === 0 || this.entryDirection === 2) {
        // 上下方向：使用 top 或 bottom
        this.renderer.setStyle(this.overlay, 'top', this.entryDirection === 0 ? '-100%' : '100%');
        this.renderer.setStyle(this.overlay, 'bottom', '0'); // 確保底部為 0，避免干擾
      } else {
        // 左右方向：使用 left
        this.renderer.setStyle(this.overlay, 'left', this.entryDirection === 3 ? '-100%' : '100%');
        this.renderer.setStyle(this.overlay, 'right', '0'); // 確保右邊為 0，避免干擾
      }
  
      // 啟動動畫，覆蓋層會從進入的方向滑入
      setTimeout(() => {
        this.renderer.setStyle(this.overlay, 'top', '0'); // 設置為 0 來進行動畫
        this.renderer.setStyle(this.overlay, 'left', '0'); // 設置為 0 來進行動畫
        this.renderer.setStyle(this.overlay, 'bottom', '0'); // 設置為 0 來進行動畫
      }, 10); // 延遲一小段時間來確保 transition 被觸發
    }
  }

  private removeOverlay(direction: number) {
    if (this.overlay) {
      const directionStyles = this.getDirectionStyles(direction);
  
      // 設置 CSS transition 動畫
      this.renderer.setStyle(this.overlay, 'transition', `all ${this.duration}`);
      
      // 根據方向調整移動位置
      if (direction === 0 || direction === 2) {
        // 當進行上下方向的過渡時，使用 'top' 或 'bottom' 屬性
        this.renderer.setStyle(this.overlay, 'top', direction === 0 ? '-100%' : '100%'); // 上或下
      } else {
        // 當進行左右方向的過渡時，使用 'left' 屬性
        this.renderer.setStyle(this.overlay, 'left', direction === 3 ? '-100%' : '100%'); // 左或右
      }
  
      // 使用 transition 監聽事件來移除 overlay
      this.renderer.listen(this.overlay, 'transitionend', () => {
        if (this.overlay) {
          this.overlay.remove();
          this.currentlyHoveredElement = null; // 清除當前的被覆蓋元素
        }
      });
    }
  }

  private getLeaveDirection(event: MouseEvent, element: HTMLElement): number {
    const rect = element.getBoundingClientRect();
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    const horizontalCenter = rect.left + rect.width / 2;
    const verticalCenter = rect.top + rect.height / 2;

    const horizontalDistance = Math.abs(mouseX - horizontalCenter);
    const verticalDistance = Math.abs(mouseY - verticalCenter);

    if (horizontalDistance > verticalDistance) {
      return mouseX < horizontalCenter ? 3 : 1; // 左（3）或 右（1）
    } else {
      return mouseY < verticalCenter ? 0 : 2; // 上（0）或 下（2）
    }
  }

  private getDirectionStyles(direction: number): { left: string, bottom: string } {
    let left = '0';
    let bottom = '0';

    switch (direction) {
      case 0:
        bottom = '100%'; break; // 上
      case 1:
        left = '100%'; break;  // 右
      case 2:
        bottom = '-100%'; break; // 下
      case 3:
        left = '-100%'; break; // 左
    }

    return { left, bottom };
  }
}