import { Directive, ElementRef, Renderer2, Input } from '@angular/core';

@Directive({
  selector: '[libImageFilter]'
})
export class ImageFilterDirective {
  @Input() filter: string = 'brightness'; // 濾鏡的默認值
  @Input() filterIntensity: string = '60%'; // 濾鏡強度

  constructor(private el: ElementRef, private renderer: Renderer2) { }

  ngOnInit() {
    this.applyFilter();
  }

  ngOnChanges() {
    this.applyFilter();
  }

  // 應用濾鏡
  private applyFilter() {
    const imageElement = this.el.nativeElement as HTMLImageElement;

    // 設定濾鏡屬性
    this.renderer.setStyle(
      imageElement,
      'filter',
      `${this.filter}(${this.filterIntensity})`
    );
  }
}