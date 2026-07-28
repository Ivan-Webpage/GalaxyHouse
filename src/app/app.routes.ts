import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { BranchShopComponent } from './branch-shop/branch-shop.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { ApplyComponent } from './apply/apply.component';
import { NewsComponent } from './news/news.component';
import { ArticleComponent } from './article/article.component';
import { BuffetComponent } from './buffet/buffet.component';
import { CateringComponent } from './catering/catering.component';

export const routes: Routes = [
    {
        path: 'home',
        component: HomeComponent
    },{
        path: 'branchShop/:id',
        component: BranchShopComponent,
    },{
        path: 'about_us',
        component: AboutUsComponent
    },{
        path: 'apply',
        component: ApplyComponent
    },{
        path: 'news/:newType/:branchShop',
        component: NewsComponent
    },{
        path: 'banquet',
        component: BuffetComponent
    },{
        path: 'catering',
        component: CateringComponent
    },{
        path: 'article/:id',
        component: ArticleComponent
    }, {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
    }
];
