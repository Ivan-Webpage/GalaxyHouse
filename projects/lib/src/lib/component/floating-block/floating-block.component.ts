import { Component, HostListener, OnInit, Input, ElementRef, Renderer2, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SlipHoverDirective, Images } from 'lib'

@Component({
  selector: 'lib-floating-block',
  imports: [SlipHoverDirective],
  templateUrl: './floating-block.component.html',
  styleUrl: './floating-block.component.scss'
})
export class FloatingBlockComponent implements OnInit {
  @Input() backgroundColer: string = "rgba(17,17,17)";
  @Input() imageData: Images[] = [];

  imageGroup: Images[][] = [];
  columns: number = 3;
  private isBrowser: boolean;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.updateColumns(window.innerWidth);
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (this.isBrowser) {
      this.updateColumns(window.innerWidth);
    }
  }

  updateColumns(width: number): void {
    if (width >= 1024) {
      this.columns = 4;
    } else if (width >= 600) {
      this.columns = 3;
    } else if (width >= 500) {
      this.columns = 2;
    } else {
      this.columns = 1;
    }

    this.imageGroup = [];
    for (let i = 0; i < this.columns; i++) {
      this.imageGroup.push([])
    }
    // 依序一個一個放進去
    for (let i = 0; i < this.imageData.length; i++) {
      this.imageGroup[i%this.columns].push(this.imageData[i])
    }
    console.log(this.imageGroup)
  }

  
}