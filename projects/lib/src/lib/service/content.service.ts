import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { Article, ArticleSimple } from '../interface/article';
import { ArticleRecord, BranchData, ApplyGroup } from '../interface/content';

const HOME_ARTICLE_LIMIT = 9;

/**
 * 取代原本 ApiService 打後端 API 的方式：改讀 public/data/*.json 靜態資料，
 * 並在前端重建原本活在 Django view 裡的過濾/排序/分組邏輯。
 */
@Injectable({
  providedIn: 'root',
})
export class ContentService {
  private articles$?: Observable<ArticleRecord[]>;
  private branchShops$?: Observable<Record<string, BranchData>>;
  private applyGroups$?: Observable<ApplyGroup[]>;

  constructor(private http: HttpClient) {}

  private loadArticles(): Observable<ArticleRecord[]> {
    if (!this.articles$) {
      this.articles$ = this.http.get<ArticleRecord[]>('data/articles.json').pipe(shareReplay(1));
    }
    return this.articles$;
  }

  private loadBranchShops(): Observable<Record<string, BranchData>> {
    if (!this.branchShops$) {
      this.branchShops$ = this.http.get<Record<string, BranchData>>('data/branch-shops.json').pipe(shareReplay(1));
    }
    return this.branchShops$;
  }

  private loadApply(): Observable<ApplyGroup[]> {
    if (!this.applyGroups$) {
      this.applyGroups$ = this.http.get<ApplyGroup[]>('data/apply.json').pipe(shareReplay(1));
    }
    return this.applyGroups$;
  }

  /** 對照原本 articleViewSet.get_queryset：state>0 且未過期（或無到期日） */
  private isActive(article: ArticleRecord, today: string): boolean {
    return article.state > 0 && (!article.expiration_date || article.expiration_date >= today);
  }

  /** 對照原本排序：expiration_date 由近到遠（無到期日排最後），再依 create_time 新到舊 */
  private sortForDisplay(list: ArticleRecord[]): ArticleRecord[] {
    return [...list].sort((a, b) => {
      const aExp = a.expiration_date ?? '9999-99-99';
      const bExp = b.expiration_date ?? '9999-99-99';
      if (aExp !== bExp) {
        return aExp < bExp ? -1 : 1;
      }
      return a.create_time < b.create_time ? 1 : -1;
    });
  }

  private toSimple(a: ArticleRecord): ArticleSimple {
    return {
      id: a.id,
      title: a.title,
      image: a.image,
      newType: { title: a.newTypeTitle, color: a.newTypeColor },
      description: a.description,
      expiration_date: a.expiration_date ?? '',
      create_date: a.create_date,
    };
  }

  private todayIso(): string {
    return new Date().toISOString().slice(0, 10);
  }

  /** 對照 GET article/?format=json：最新 9 篇上架中且未過期的文章 */
  getRecentArticles(): Observable<ArticleSimple[]> {
    const today = this.todayIso();
    return this.loadArticles().pipe(
      map((list) =>
        this.sortForDisplay(list.filter((a) => this.isActive(a, today)))
          .slice(0, HOME_ARTICLE_LIMIT)
          .map((a) => this.toSimple(a))
      )
    );
  }

  /** 對照 POST article/pick_news_type/：依文章分類（與可選的分店）篩選，無筆數上限 */
  getArticlesByNewsType(newType: string, branchShop: string): Observable<ArticleSimple[]> {
    const today = this.todayIso();
    return this.loadArticles().pipe(
      map((list) => {
        let filtered = list.filter((a) => this.isActive(a, today) && a.newTypeEnglishName === newType);
        if (branchShop !== 'galaxyhouse') {
          filtered = filtered.filter((a) => a.branchShopEnglishName === branchShop);
        }
        return this.sortForDisplay(filtered).map((a) => this.toSimple(a));
      })
    );
  }

  /** 對照 GET article/{id}/pick_article/：單篇文章，只檢查 state（不檢查到期日） */
  getArticleById(id: number): Observable<Article | undefined> {
    return this.loadArticles().pipe(
      map((list) => {
        const a = list.find((x) => x.id === id && x.state > 0);
        if (!a) {
          return undefined;
        }
        return {
          id: a.id,
          title: a.title,
          image: a.image,
          description: a.description,
          content: a.content,
          newType: a.newTypeTitle,
          expiration_date: a.expiration_date ?? '',
          create_date: a.create_date,
        };
      })
    );
  }

  /** 對照 GET branchShop/{englishName}/pick_classify/ */
  getBranchShop(englishName: string): Observable<BranchData | undefined> {
    return this.loadBranchShops().pipe(map((all) => all[englishName]));
  }

  /** 對照 GET apply/shopClassification/ */
  getApplyClassification(): Observable<ApplyGroup[]> {
    return this.loadApply();
  }
}
