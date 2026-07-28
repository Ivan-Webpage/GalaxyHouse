import { Component, Input, HostListener, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { StickyDirective, MenuItem, DestroyService } from 'lib';
import { isPlatformBrowser } from '@angular/common';
import { takeUntil } from 'rxjs/operators';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'lib-navbar',
  standalone: true,
  imports: [RouterModule, StickyDirective],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  providers: [DestroyService]
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Input() navbarBackbroundColor: string = "rgba(27,27,27)";
  @Input() navbarTextColor: string = "rgba(218,162,27)";
  @Input() dropdownBackbroundColor: string = "rgba(27,27,27,0.9)";
  @Input() dropdownTextColor: string = "rgba(255,255,255)";
  @Input() subCategoryImg: string = "";
  @Input() subCategoryImgAlt: string = "";
  @Input() title: string = "Galaxy House 銀河會所";
  @Input() titleImage: string = "images/logo.png";

  @Input() menuData: MenuItem[] = [
    { title: "首頁", link: "/home" },
    {
      title: "據點資訊",
      link: "",
      subMenu: [
        {
          category: "北區",
          subCategory: [
            { title: "天母店", link: "/store/tianmu", hero: "images/hero_1.jpg" },
            { title: "松山店", link: "/store/songshan", hero: "images/hero_2.jpg" }
          ]
        }
      ]
    }
  ];

  isMobile = false;
  isMobileMenuActive = true;
  activeDropdown: number | null = null;
  isBrowser: boolean;

  constructor(
    private router: Router,
    private destroy$: DestroyService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.updateDeviceType(window.innerWidth);

      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      ).subscribe(() => {
        if (this.isMobile) {
          this.closeMenu();
        }
      });
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    if (this.isBrowser) {
      this.updateDeviceType(event.target.innerWidth);
    }
  }

  updateDeviceType(width: number): void {
    this.isMobile = width <= 768;
    this.isMobileMenuActive = !this.isMobile;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuActive = !this.isMobileMenuActive;
  }

  closeMenu(): void {
    if (this.isMobile) {
      this.isMobileMenuActive = false;
      this.activeDropdown = null;
    }
  }

  showDropdown(index: number): void {
    if (!this.isMobile) {
      this.activeDropdown = index;
    }
  }

  hideDropdown(): void {
    if (!this.isMobile) {
      this.activeDropdown = null;
    }
  }

  toggleDropdown(index: number): void {
    if (this.isMobile) {
      this.activeDropdown = this.activeDropdown === index ? null : index;
    }
  }

  ngOnDestroy(): void {
    // DestroyService 會自動清理訂閱
  }
}
