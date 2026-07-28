import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faLine } from "@fortawesome/free-brands-svg-icons";
import {
  ContentService,
  Article,
  SlideshowComponent,
  MakeMetaService,
  ImageFilterDirective,
  ArticleSimple,
  DestroyService
 } from 'lib';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'lib-article',
  imports: [ImageFilterDirective, FontAwesomeModule, SlideshowComponent],
  templateUrl: './article.component.html',
  styleUrl: './article.component.scss',
  providers: [DestroyService]
})
export class ArticleComponent implements OnInit, OnDestroy {
  faLine = faLine;
  articleData: Article | null = null;
  news: ArticleSimple[] = [];
  isBrowser: boolean;

  constructor(
    private router: Router,
    private meta: MakeMetaService,
    private route: ActivatedRoute,
    private content: ContentService,
    private destroy$: DestroyService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    // 取得路由參數
    const articleId = Number(this.route.snapshot.paramMap.get('id')) || 0;

    this.content.getArticleById(articleId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (article) => {
        this.articleData = article || null;

        if (article) {
          const plainDescription = article.description.replace(/\s+/g, ' ').trim().slice(0, 100);
          this.meta.set(
            article.title,
            article.newType || '最新消息',
            plainDescription,
            'https://thegalaxyhouse.com/' + article.image
          );
        }
      },
      error: (error) => {
        console.error('Error fetching article data', error);
      }
    });

    this.content.getRecentArticles().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (articles) => {
        this.news = articles;
      },
      error: (error) => {
        console.error('Error fetching news data', error);
      }
    });
  }

  ngOnDestroy(): void {
    // DestroyService 會自動清理訂閱
  }
}
