const routes = [{
  path: '/',
  component: () =>
    import('layouts/MainLayout.vue'),
  children: [{
    path: '',
    component: () =>
      import('pages/Index.vue')
  },
  {
    path: 'user',
    component: () =>
      import('pages/User.vue')
  },
  {
    path: 'userGroup',
    component: () =>
      import('pages/UserGroup.vue')
  },
  {
    path: 'productCategory/:type',
    component: () =>
      import('pages/ProductCategory.vue')
  },
  {
    path: 'brand',
    component: () =>
      import('pages/Brand.vue')
  },
  {
    path: 'attribute',
    component: () =>
      import('pages/Attribute.vue')
  },
  {
    path: 'customerCategory',
    component: () =>
      import('pages/CustomerCategory.vue')
  },
  {
    path: 'customerActivity',
    component: () =>
      import('pages/CustomerActivity.vue')
  },
  {
    path: 'Product',
    component: () =>
      import('pages/Product.vue')
  },
  {
    path: 'Inventory',
    component: () =>
      import('pages/Inventory.vue')
  },
  {
    path: 'Stock',
    component: () =>
      import('pages/Stock.vue')
  },
  {
    path: 'StockMovement',
    component: () =>
      import('pages/StockMovement.vue')
  },
  {
    path: 'Input',
    component: () =>
      import('pages/Input.vue')
  },
  {
    path: 'Output',
    component: () =>
      import('pages/Output.vue')
  },
  {
    path: 'Customer',
    component: () =>
      import('pages/Customer.vue')
  },
  {
    path: 'ShippingFee',
    component: () =>
      import('pages/Shipping.vue')
  },
  {
    path: 'Order',
    component: () =>
      import('pages/Order.vue')
  },
  {
    path: 'Shipping',
    component: () =>
      import('pages/OrderShipping.vue')
  },
  {
    path: 'Return',
    component: () =>
      import('pages/ReturnedOrder.vue')
  },
  {
    path: 'CustomerSearch',
    component: () =>
      import('pages/CustomerSearch.vue')
  },
  {
    path: 'CustomerNotice',
    component: () =>
      import('pages/CustomerNotice.vue')
  },
  {
    path: 'Chat',
    component: () =>
      import('pages/Chat.vue')
  },
  {
    path: 'configuration',
    component: () =>
      import('pages/Configuration.vue')
  },
  {
    path: 'pub',
    component: () =>
      import('pages/Pub.vue')
  }
  ],
  meta: { requiresAuth: true }
},
{
  path: '/login',
  component: () =>
    import('layouts/EmptyLayout.vue'),
  children: [{
    path: '',
    component: () =>
      import('pages/AuthPage.vue')
  }],
  meta: { noAuth: true }
},

// Always leave this as last one,
// but you can also remove it
{
  path: '*',
  component: () =>
    import('pages/Error404.vue')
}
]

export default routes
