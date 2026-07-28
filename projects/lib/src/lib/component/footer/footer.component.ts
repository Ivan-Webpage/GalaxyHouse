import { Component } from '@angular/core';
import { faFacebookF, faInstagram, faMedium, faLine } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'lib-footer',
  imports: [FontAwesomeModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  faLine = faLine;
  faFacebookF = faFacebookF;
  faInstagram = faInstagram;
  faMedium = faMedium;

  currentYear: number = new Date().getFullYear();
}
