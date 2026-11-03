import { HttpInterceptorFn } from '@angular/common/http';

import { mockDatasetFields } from '../app/pages/record-details/record-datasets/series-datasets.mock';

export const environment = {
  production: false,
  geonetworkApiUrl: '/geonetwork',
  collectionId: '3bef299d-cf82-4033-871b-875f6936b2e2',
  httpInterceptors: [mockDatasetFields] as HttpInterceptorFn[],
};
