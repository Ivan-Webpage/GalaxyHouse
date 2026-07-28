import { Component, Input, OnChanges, SimpleChanges, ViewChild, Inject, PLATFORM_ID  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { FullCalendarModule, FullCalendarComponent } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ArticleSimple } from '../../../lib/interface/article';

@Component({
  selector: 'lib-calendar',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnChanges {
  @Input() news: ArticleSimple[] = [];
  @ViewChild(FullCalendarComponent) calendarComponent!: FullCalendarComponent;
  isBrowser = false;

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
    eventClick: (info: any) => {
      if (info.event.url) {
        window.open(info.event.url, '_blank');
        info.jsEvent.preventDefault();
      }
    },
    dayMaxEvents: true,
    navLinks: true,
    height: 'auto'
  };

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['news'] && this.news?.length) {
      const mappedEvents = this.news.map((n: ArticleSimple) => ({
        id: String(n.id),
        title: n.title,
        date: n.expiration_date,
        color: n.newType?.color || '#3788d8',
        url: `/article/${n.id}`
      }));

      if (this.calendarComponent) {
        const calendarApi = this.calendarComponent.getApi();
        calendarApi.removeAllEvents();
        calendarApi.addEventSource(mappedEvents);
      } else {
        // 如果 viewChild 尚未 ready，就直接更新 options
        this.calendarOptions = {
          ...this.calendarOptions,
          events: mappedEvents
        };
      }
    }
  }
}
