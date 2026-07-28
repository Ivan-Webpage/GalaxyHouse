import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http'; // 導入 HttpClientModule
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
          routes,
          withEnabledBlockingInitialNavigation(),
          withInMemoryScrolling({
            scrollPositionRestoration: 'enabled', // 回到原位置
            anchorScrolling: 'enabled',           // 支援 #anchor
          })
        ),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()), // 加入HttpClient，讀取靜態 JSON 資料（withFetch 讓 SSR/prerender 階段也能正常運作）
  ]
};
