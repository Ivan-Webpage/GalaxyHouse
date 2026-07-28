import { Directive, ElementRef, Renderer2, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[libAnimationInto]'
})
export class AnimationIntoDirective implements AfterViewInit {
  private isBrowser: boolean;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      this.createIntersectionObserver();
    }
  }

  private createIntersectionObserver() {
    if (!('IntersectionObserver' in window)) {
      // 假如舊瀏覽器沒有支援，可以直接 fallback 成立即加動畫
      this.addAnimation();
      return;
    }

    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver(this.onIntersect.bind(this), options);
    observer.observe(this.el.nativeElement);
  }

  private onIntersect(entries: IntersectionObserverEntry[]) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.addAnimation();
      }
    });
  }

  private addAnimation() {
    const element = this.el.nativeElement;
    this.renderer.addClass(element, 'animate');
  }
}
