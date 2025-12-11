
export default {
  basePath: 'https://dastgeertech.github.io/pos-prject',
  supportedLocales: {
  "en-US": ""
},
  entryPoints: {
    '': () => import('./main.server.mjs')
  },
};
