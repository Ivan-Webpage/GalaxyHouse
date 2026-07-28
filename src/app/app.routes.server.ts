import { RenderMode, ServerRoute } from '@angular/ssr';
import { routesIDsBranchShop, routesIDsNewType } from './routes-ids';
import articles from '../../public/data/articles.json';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'branchShop/:id',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      const ids = routesIDsBranchShop;
      return ids.map(id => ({ id }));
    },
  }, {
    path: 'news/:newType/:branchShop',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      const params: Array<{ newType: string; branchShop: string }> = [];

      routesIDsBranchShop.push('galaxyhouse')
      // 產生所有組合
      for (const type of routesIDsNewType) {
        for (const shop of routesIDsBranchShop) {
          params.push({ newType: type, branchShop: shop });
        }
      }
      return params;
    },
  }, {
    path: 'article/:id',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return (articles as Array<{ id: number; state: number }>)
        .filter((a) => a.state > 0)
        .map((a) => ({ id: String(a.id) }));
    },
  }, {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
