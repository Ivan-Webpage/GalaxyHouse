import { Component, Input } from '@angular/core';

@Component({
  selector: 'lib-collapsible',
  imports: [],
  templateUrl: './collapsible.component.html',
  styleUrl: './collapsible.component.scss'
})
export class CollapsibleComponent {
  @Input() title: string = "請輸入標題";
  @Input() pay: string = "$ 22,000";
  @Input() detail: string = "工作內容";
  @Input() location: string = "工作地點";
  @Input() how2Pay: string[] = [];
  @Input() workTime: string = "工作時段"; 
  @Input() welfare: string[] = []; 
  
  isCollapsed: boolean = true;  // 控制折叠状态
  arrow: string = 'arrowDown';

  // 切换折叠状态
  toggle() {
    this.isCollapsed = !this.isCollapsed;
    if(this.isCollapsed){
      this.arrow='arrowDown'
    }else{
      this.arrow='arrowUp'
    }
  }

  
}
