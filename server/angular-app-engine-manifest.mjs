
export default {
  basePath: '/Ivan-Webpage/GalaxyHouse',
  supportedLocales: {
  "en-US": ""
},
  entryPoints: {
    '': () => import('./main.server.mjs')
  },
};
