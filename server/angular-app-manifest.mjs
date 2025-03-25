
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/Ivan-Webpage/GalaxyHouse/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "redirectTo": "/Ivan-Webpage/GalaxyHouse/home",
    "route": "/Ivan-Webpage/GalaxyHouse"
  },
  {
    "renderMode": 2,
    "route": "/Ivan-Webpage/GalaxyHouse/home"
  },
  {
    "renderMode": 2,
    "route": "/Ivan-Webpage/GalaxyHouse/branchShop_Songshan"
  },
  {
    "renderMode": 2,
    "route": "/Ivan-Webpage/GalaxyHouse/branchShop_Tianmu"
  },
  {
    "renderMode": 2,
    "route": "/Ivan-Webpage/GalaxyHouse/about_us"
  },
  {
    "renderMode": 2,
    "route": "/Ivan-Webpage/GalaxyHouse/apply"
  },
  {
    "renderMode": 2,
    "route": "/Ivan-Webpage/GalaxyHouse/news"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 2338, hash: 'b299763a6f62cbe5a31fe50b8e50b447ea05d727f6a59f15b35ed2a38482c161', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 2543, hash: '85cc01ded679f94357a5abac2f040615b73fcc22b1516351ec0afc1fdcab2ec3', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'about_us/index.html': {size: 25958, hash: '45c3ae9b891afc67e0459b46370baec4bb028268e5d7ce79644a629c7c29505d', text: () => import('./assets-chunks/about_us_index_html.mjs').then(m => m.default)},
    'branchShop_Tianmu/index.html': {size: 55041, hash: '2093c59af1da2aad843e6d777ace953410896c551a0ebdbab57cb6b719a19386', text: () => import('./assets-chunks/branchShop_Tianmu_index_html.mjs').then(m => m.default)},
    'home/index.html': {size: 49357, hash: '59cb810815249369ea5b4cf10d9cce9400fab66e3e1d97fb3a5a1ce794994a5b', text: () => import('./assets-chunks/home_index_html.mjs').then(m => m.default)},
    'branchShop_Songshan/index.html': {size: 55041, hash: '2093c59af1da2aad843e6d777ace953410896c551a0ebdbab57cb6b719a19386', text: () => import('./assets-chunks/branchShop_Songshan_index_html.mjs').then(m => m.default)},
    'apply/index.html': {size: 23699, hash: 'd848f82e484616d866941751f257cf34af656edb18589e67ec93e51b46afb47d', text: () => import('./assets-chunks/apply_index_html.mjs').then(m => m.default)},
    'news/index.html': {size: 22546, hash: '96ff29d78f9a0885dd3b1520ebfcb3d7ef98d328d9c63145e430680655e93d15', text: () => import('./assets-chunks/news_index_html.mjs').then(m => m.default)},
    'styles-5IIVQG2Z.css': {size: 3183, hash: '0K9i3qwd6GE', text: () => import('./assets-chunks/styles-5IIVQG2Z_css.mjs').then(m => m.default)}
  },
};
