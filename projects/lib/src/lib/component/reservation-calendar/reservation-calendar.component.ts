import { Component, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { FullCalendarModule, FullCalendarComponent } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ReservationBlock } from '../../../lib/interface/content';

@Component({
  selector: 'lib-reservation-calendar',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './reservation-calendar.component.html',
  styleUrls: ['./reservation-calendar.component.scss']
})
export class ReservationCalendarComponent implements OnChanges, OnDestroy {
  @Input() reservations: ReservationBlock[] = [];
  /** 每週固定公休的星期幾，0=週日、1=週一...6=週六，預設週一（松山店、天母店目前都是週一公休） */
  @Input() closedWeekdays: number[] = [1];
  @ViewChild(FullCalendarComponent) calendarComponent!: FullCalendarComponent;
  isBrowser = false;

  /** 點擊某個時段時，懸浮顯示該列的完整文字（月曆格子太窄會被裁切成「20:00-21:00 9/30漫霧」） */
  tooltipText: string | null = null;
  tooltipPosition = { x: 0, y: 0 };

  calendarOptions: any = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locale: 'zh-tw',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: ''
    },
    events: [],
    displayEventTime: false,
    dayMaxEvents: true,
    navLinks: false,
    height: 'auto',
    // 滑鼠移過去用瀏覽器原生 title 顯示完整文字
    eventDidMount: (info: any) => {
      info.el.setAttribute('title', info.event.title);
    },
    // 點擊（尤其手機無法 hover）用自訂的懸浮框顯示完整文字
    eventClick: (info: any) => {
      info.jsEvent.stopPropagation();
      this.tooltipText = info.event.title;
      this.tooltipPosition = { x: info.jsEvent.clientX, y: info.jsEvent.clientY };
    }
  };

  private readonly closeTooltipOnOutsideClick = () => {
    this.tooltipText = null;
  };

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      document.addEventListener('click', this.closeTooltipOnOutsideClick);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['reservations'] || changes['closedWeekdays']) {
      const closedEvents = this.closedWeekdays.map((weekday) => ({
        id: `closed-${weekday}`,
        daysOfWeek: [weekday],
        title: '公休',
        color: '#777777'
      }));

      // label 剛好是「公休」時（例如某天臨時/連假公休），比照上面每週固定公休的樣式：
      // 不顯示時段、改用同一個灰色，而不是一般預約的「時段+文字」棕色標籤。
      const mappedEvents = this.reservations.map((r, index) => {
        const isClosure = r.label === '公休';
        return {
          id: `${r.date}-${index}`,
          title: isClosure ? '公休' : `${r.startTime}~${r.endTime} ${r.label || '已預訂'}`,
          date: r.date,
          color: isClosure ? '#777777' : '#8C4F28'
        };
      });

      const allEvents = [...closedEvents, ...mappedEvents];

      if (this.calendarComponent) {
        const calendarApi = this.calendarComponent.getApi();
        calendarApi.removeAllEvents();
        calendarApi.addEventSource(allEvents);
      } else {
        this.calendarOptions = {
          ...this.calendarOptions,
          events: allEvents
        };
      }
    }
  }

  ngOnDestroy(): void {
    if (this.isBrowser) {
      document.removeEventListener('click', this.closeTooltipOnOutsideClick);
    }
  }
}
