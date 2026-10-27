import { HttpInterceptorFn } from '@angular/common/http';

import { mockBusinessDomains } from '../app/domain-tree/business-domain.mock';

export const environment = {
  production: false,
  geonetworkApiUrl: '/geonetwork',
  collectionId: '3bef299d-cf82-4033-871b-875f6936b2e2',
  httpInterceptors: [mockBusinessDomains] as HttpInterceptorFn[],
};
