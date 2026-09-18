import { Component, Input, OnChanges, SimpleChanges, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
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
export class ReservationCalendarComponent implements OnChanges {
  @Input() reservations: ReservationBlock[] = [];
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
    displayEventTime: false,
    dayMaxEvents: true,
    navLinks: false,
    height: 'auto'
  };

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['reservations']) {
      const mappedEvents = this.reservations.map((r, index) => ({
        id: `${r.date}-${index}`,
        title: `${r.startTime} - ${r.endTime} 已預訂`,
        date: r.date,
        color: '#8C4F28'
      }));

      if (this.calendarComponent) {
        const calendarApi = this.calendarComponent.getApi();
        calendarApi.removeAllEvents();
        calendarApi.addEventSource(mappedEvents);
      } else {
        this.calendarOptions = {
          ...this.calendarOptions,
          events: mappedEvents
        };
      }
    }
  }
}
