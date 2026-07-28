import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

const SITE_ORIGIN = 'https://thegalaxyhouse.com';

/**
 * Angular 的 Meta.addTags 在這個專案的 SSR/prerender 流程中無法可靠地找到
 * index.html 裡已經存在的同名 static tag（會變成兩個重複的 tag，且爬蟲通常
 * 只讀第一個，導致仍然讀到 index.html 裡寫死的預設值）。
 * 因此改成自己用 attr（name 或 property）+ 值直接 query 既有 tag 來更新，
 * 找不到才新增，確保同一個 attr 永遠只有一個 tag。
 */
type MetaAttr = 'name' | 'property';

@Injectable({
  providedIn: 'root'
})
export class MakeMetaService {
  constructor(
    private titleService: Title,
    private router: Router,
    @Inject(DOCUMENT) private document: Document
  ) { }

  set(title:string, keywords:string, description:string, image:string) {
      const fullTitle = title+'｜'+keywords + '－GalaxyHouse銀河會所';
      const canonicalUrl = this.buildCanonicalUrl();

      this.titleService.setTitle(fullTitle);

      this.upsertMeta('name', 'title', fullTitle);
      this.upsertMeta('name', 'keywords', keywords);
      this.upsertMeta('name', 'description', description);
      this.upsertMeta('name', 'viewport', 'width=device-width, initial-scale=1.');
      this.upsertMeta('name', 'robots', 'index,follow,max-image-preview:large');
      this.upsertMeta('name', 'theme-color', '#efd07f');

      this.upsertMeta('property', 'og:title', fullTitle);
      this.upsertMeta('property', 'og:description', description);
      this.upsertMeta('property', 'og:image', image);
      this.upsertMeta('property', 'og:image:alt', description);
      this.upsertMeta('property', 'og:image:width', '600');
      this.upsertMeta('property', 'og:image:height', '600');
      this.upsertMeta('property', 'og:url', canonicalUrl);
      this.upsertMeta('property', 'og:locale', 'zh_TW');
      this.upsertMeta('property', 'og:type', 'article');
      this.upsertMeta('property', 'og:site_name', 'Galaxy House 銀河會所');
      this.upsertMeta('property', 'al:web:url', canonicalUrl);
      this.upsertMeta('property', 'article:publisher', 'https://www.facebook.com/thegalaxyhouse');

      this.upsertMeta('name', 'twitter:card', 'summary_large_image');
      this.upsertMeta('name', 'twitter:title', fullTitle);
      this.upsertMeta('name', 'twitter:description', description);
      this.upsertMeta('name', 'twitter:image', image);

      this.setCanonicalLink(canonicalUrl);
  }

  /** 每個路由各自的絕對網址，取代原本寫死在 index.html 裡永遠指向首頁的版本 */
  private buildCanonicalUrl(): string {
    const path = this.router.url.split('?')[0].split('#')[0];
    return SITE_ORIGIN + (path === '/' ? '/' : path);
  }

  private upsertMeta(attr: MetaAttr, value: string, content: string): void {
    let tag = this.document.querySelector(`meta[${attr}="${value}"]`) as HTMLMetaElement | null;
    if (!tag) {
      tag = this.document.createElement('meta');
      tag.setAttribute(attr, value);
      this.document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
  }

  private setCanonicalLink(url: string): void {
    let link = this.document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}
