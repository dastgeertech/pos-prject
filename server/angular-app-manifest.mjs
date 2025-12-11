
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: 'https://dastgeertech.github.io/pos-prject/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/pos-prject"
  },
  {
    "renderMode": 2,
    "route": "/pos-prject/dashboard"
  },
  {
    "renderMode": 2,
    "route": "/pos-prject/pos"
  },
  {
    "renderMode": 2,
    "route": "/pos-prject/products"
  },
  {
    "renderMode": 2,
    "route": "/pos-prject/customers"
  },
  {
    "renderMode": 2,
    "route": "/pos-prject/employees"
  },
  {
    "renderMode": 2,
    "route": "/pos-prject/inventory"
  },
  {
    "renderMode": 2,
    "route": "/pos-prject/payment"
  },
  {
    "renderMode": 2,
    "route": "/pos-prject/reports"
  },
  {
    "renderMode": 2,
    "route": "/pos-prject/advanced-reports"
  },
  {
    "renderMode": 2,
    "route": "/pos-prject/business"
  },
  {
    "renderMode": 2,
    "route": "/pos-prject/locations"
  },
  {
    "renderMode": 2,
    "route": "/pos-prject/cloud-features"
  },
  {
    "renderMode": 2,
    "route": "/pos-prject/hardware-management"
  },
  {
    "renderMode": 2,
    "route": "/pos-prject/settings"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 2604, hash: '6081c10302a9770788f8142376697c97f24dce393be2e70049024d3ebcdbf5f0', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1167, hash: 'b911224c3458b591c1a794d1b9700666fbefecf7ae72f7c8435f44abda1659e1', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'index.html': {size: 285, hash: '31971ff888d2b5dc66b22668dedc2e84f4fe41c0fd4839040a6465948662ac18', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'inventory/index.html': {size: 39812, hash: '8c44723ad6bbea50b54e5b3206db75edd4f65e0d8623fd37592a5e6d8be2da7d', text: () => import('./assets-chunks/inventory_index_html.mjs').then(m => m.default)},
    'dashboard/index.html': {size: 32316, hash: '7059f2a5868875e9a5e69766e88ad736ec20a678d58adef9f4657c16c822caec', text: () => import('./assets-chunks/dashboard_index_html.mjs').then(m => m.default)},
    'cloud-features/index.html': {size: 31892, hash: '63d2508c6dfe1d691007c779b56f91d3a7d2a0e5480e312bc45ca94fbac911a5', text: () => import('./assets-chunks/cloud-features_index_html.mjs').then(m => m.default)},
    'employees/index.html': {size: 39917, hash: 'd19ba0efa56a65cacbab2c67c827718a84f9f9f87d61e73abd53e6bfbf3470c6', text: () => import('./assets-chunks/employees_index_html.mjs').then(m => m.default)},
    'settings/index.html': {size: 47069, hash: '98f60c3133b188be90bc09cdc0139834a45773a9b679d45df3381e9137baf0c4', text: () => import('./assets-chunks/settings_index_html.mjs').then(m => m.default)},
    'business/index.html': {size: 42826, hash: '19a49d11c3abd8bd1e53f6fe40418610187752b8e62ccc4dd689a3618aa1f775', text: () => import('./assets-chunks/business_index_html.mjs').then(m => m.default)},
    'products/index.html': {size: 34961, hash: '20cac21ff5eebdc0c366e3c99598899ba87f5bed53a01d75aded47ee3b5c6084', text: () => import('./assets-chunks/products_index_html.mjs').then(m => m.default)},
    'hardware-management/index.html': {size: 59070, hash: '80a005cfcc507904164742a86480f3b939065d7d20f5bc9f53b6d267c3792b9b', text: () => import('./assets-chunks/hardware-management_index_html.mjs').then(m => m.default)},
    'advanced-reports/index.html': {size: 39855, hash: 'eb52799721bf802dd7264f35f1a507ad9502dec1567d0db1df5284c323b97787', text: () => import('./assets-chunks/advanced-reports_index_html.mjs').then(m => m.default)},
    'payment/index.html': {size: 47899, hash: 'e2631bd987fa9c782b24e241cd6f2aa8c3a8825e1c60fe487565b293285f49bf', text: () => import('./assets-chunks/payment_index_html.mjs').then(m => m.default)},
    'customers/index.html': {size: 32815, hash: '487d6c183b5fe15bdb3a5a863d1eab06a8a43f8f8d3c2fde745111b28f6bd3b3', text: () => import('./assets-chunks/customers_index_html.mjs').then(m => m.default)},
    'reports/index.html': {size: 35864, hash: '55a86609f69c051cc6e63be50ba288e59b1407c54dd7ce3617c339fdae0003c0', text: () => import('./assets-chunks/reports_index_html.mjs').then(m => m.default)},
    'locations/index.html': {size: 47635, hash: '1b54c194a5330d429e5e7f31e61e05bd9db38bd7dda362e4b0c978f75573bcb0', text: () => import('./assets-chunks/locations_index_html.mjs').then(m => m.default)},
    'pos/index.html': {size: 34964, hash: 'd539672760993e57639b8a652fc390406e1446670ef95f5a520515b85f1a91db', text: () => import('./assets-chunks/pos_index_html.mjs').then(m => m.default)},
    'styles-EL3BSBXW.css': {size: 33146, hash: 'AMfy63f9rIU', text: () => import('./assets-chunks/styles-EL3BSBXW_css.mjs').then(m => m.default)}
  },
};
