import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs';

interface DatasetFixture {
  formats: string[];
  published?: string;
  start?: string;
  end?: string;
}

const DATASETS: Record<string, DatasetFixture> = {
  '047f71ee-dec6-4c7b-8044-7a153c025588': {
    formats: ['SHP'],
    published: '2016-09-19',
    start: '2005-01-01',
    end: '2013-12-31',
  },
  '05ae1ee1-e550-4e66-b74d-4926322d981a': {
    formats: ['FlatGeobuf'],
    published: '2026-01-31',
    start: '2020-01-01',
    end: '2022-12-31',
  },
  '08560441-2fd5-4eb9-bf4c-9ef16725726a': {
    formats: ['GeoTIFF'],
    published: '2019-06-14',
    start: '2005-01-01',
    end: '2007-12-31',
  },
  '17ab2088-6907-470f-90b6-8c1364865803': {
    formats: ['GDB', 'Spatialite'],
    published: '2019-06-14',
    start: '1986-01-01',
    end: '2001-12-31',
  },
  '205691b3-7ae9-41dd-abf1-1fbf60d72c8c': {
    formats: ['Geopackage'],
    published: '2020-05-06',
    start: '2017-01-01',
    end: '2019-12-31',
  },
  '2650ec59-f8df-4072-8a9c-9cc951fd7661': {
    formats: ['FlatGeobuf'],
    published: '2026-01-31',
    start: '2018-01-01',
    end: '2021-12-31',
  },
  '2d6f67b9-c912-4ba5-94ee-1af821a24729': {
    formats: ['GeoTIFF'],
    start: '2000-01-01',
    end: '2006-12-31',
  },
  '32883574-90dd-4021-843f-f9ea6b22bfce': {
    formats: ['GeoTIFF'],
    published: '2019-06-14',
    start: '2005-01-01',
    end: '2013-12-31',
  },
  '3899a4a7-dd0b-4729-b24f-278844f1a686': {
    formats: ['GDB', 'Spatialite'],
    published: '2019-06-14',
    start: '1999-01-01',
    end: '2007-12-31',
  },
  '42690e05-edf4-43fc-8020-33e130f62023': {
    formats: ['GeoTIFF'],
    published: '2022-10-06',
    start: '2012-01-01',
    end: '2014-12-31',
  },
  '551d6741-84d0-43fb-bda8-1768d51bbb4c': {
    formats: ['SHP'],
    published: '2015-07-11',
    start: '2005-01-01',
    end: '2007-12-31',
  },
  '55854f4a-19b7-49f3-abd3-4f974a683d6f': {
    formats: ['GeoTIFF'],
    published: '2018-04-19',
    start: '2011-01-01',
    end: '2014-12-31',
  },
  '5654b422-af84-4115-ac3c-5d7dea540ebb': {
    formats: ['GeoTIFF'],
    published: '2019-06-14',
    start: '2012-01-01',
    end: '2018-12-31',
  },
  '5c1f2e03-fcba-47b1-afeb-bc05a47bada0': {
    formats: ['GDB', 'Spatialite'],
    published: '2019-06-14',
    start: '1986-01-01',
    end: '1998-12-31',
  },
  '71c95a07-e296-44fc-b22b-415f42acfdf0': {
    formats: ['GDB', 'Spatialite'],
    published: '2019-06-14',
    start: '2017-01-01',
    end: '2018-12-31',
  },
  '7c96ac5d-399e-4151-a780-1f974fd75123': {
    formats: ['GeoTIFF'],
    published: '2019-06-14',
    start: '1999-01-01',
    end: '2007-12-31',
  },
  '8b85b479-6afb-42c6-817c-11d1a5260b83': {
    formats: ['GDB', 'Spatialite'],
    published: '2019-06-14',
    start: '1999-01-01',
    end: '2001-12-31',
  },
  '916c0ee7-9711-4996-9876-95ea45ce1d27': {
    formats: ['GDB', 'Spatialite'],
    published: '2019-06-14',
    start: '2011-01-01',
    end: '2012-12-31',
  },
  '93eede6e-c196-40e3-9253-7f2237b49de1': {
    formats: ['GDB', 'Spatialite'],
    published: '2019-06-14',
    start: '2005-01-01',
    end: '2007-12-31',
  },
  '949683b7-5795-4c72-845f-77d049010649': {
    formats: ['Geopackage'],
    published: '2020-04-16',
    start: '2011-01-01',
    end: '2019-12-31',
  },
  '960998c1-1870-4e82-8051-6485205ebbac': {
    formats: ['GeoTIFF'],
    published: '2019-06-14',
    start: '2017-01-01',
    end: '2018-12-31',
  },
  '9911fe21-57f6-46fb-ae26-d76e7bb6378f': {
    formats: ['FlatGeobuf'],
    published: '2026-01-31',
    start: '2017-01-01',
    end: '2019-12-31',
  },
  'a84ae124-c5c5-4577-8e10-511bfe55cc0d': {
    formats: ['GeoTIFF'],
    published: '2019-06-14',
    start: '2011-01-01',
    end: '2012-12-31',
  },
  'c5215520-98e9-4035-be56-d28156cd4dcd': {
    formats: ['GeoTIFF'],
    published: '2026-01-31',
    start: '2020-01-01',
    end: '2022-12-31',
  },
  'c62bb056-5ac3-4512-b642-7f484175d951': {
    formats: ['GeoTIFF'],
    published: '2019-06-14',
    start: '1986-01-01',
    end: '2001-12-31',
  },
  'c89324ef-7729-4477-9f1b-623f5f88eaa1': {
    formats: ['GeoTIFF'],
    published: '2019-06-14',
    start: '1986-01-01',
    end: '1998-12-31',
  },
  'd11f66eb-a6c5-4687-b32e-881d78ec879d': {
    formats: ['SHP'],
    published: '2016-05-23',
    start: '2011-01-01',
    end: '2013-12-31',
  },
  'ddacbd5e-068f-4e52-a596-d606e8de7f40': {
    formats: ['GeoTIFF'],
    published: '2019-06-14',
    start: '1999-01-01',
    end: '2001-12-31',
  },
  'debc1869-a4a2-4611-ae95-daeefce23490': {
    formats: ['SHP', 'Geopackage'],
    published: '2016-08-04',
    start: '2011-01-01',
    end: '2013-12-31',
  },
  'ed0018c3-5ad0-4721-b5e4-0042aeaf9d00': {
    formats: ['FlatGeobuf'],
    published: '2026-01-31',
    start: '2020-01-01',
    end: '2021-12-31',
  },
  'f30f1000-7cf8-43bb-872c-5eb093911b24': {
    formats: ['GDB', 'Spatialite'],
    published: '2019-06-14',
    start: '2012-01-01',
    end: '2018-12-31',
  },
  'fb4dffa1-6ceb-4cc0-8372-1ed354c285e6': {
    formats: ['Geopackage'],
    published: '2020-04-16',
    start: '2017-01-01',
    end: '2019-12-31',
  },
  'fe3425ad-a71e-454c-97a9-586613af8191': {
    formats: ['GDB', 'Spatialite'],
    published: '2019-06-14',
    start: '2005-01-01',
    end: '2013-12-31',
  },
};

interface MockedFeature {
  id: string;
  time?: { interval?: (string | null)[] };
  properties: Record<string, unknown>;
}

const withFixture = (feature: MockedFeature): MockedFeature => {
  const fixture = DATASETS[feature.id];
  if (!fixture) return feature;
  return {
    ...feature,
    time:
      fixture.start || fixture.end
        ? { interval: [fixture.start ?? null, fixture.end ?? null] }
        : feature.time,
    properties: {
      ...feature.properties,
      formats: fixture.formats.map((name) => ({ name })),
      publicationDateForResource: fixture.published ? [fixture.published] : undefined,
    },
  };
};

export const mockDatasetFields: HttpInterceptorFn = (request, next) => {
  if (!request.params.has('ids')) return next(request);
  return next(request).pipe(
    map((event) => {
      if (!(event instanceof HttpResponse)) return event;
      const body = event.body as { features?: MockedFeature[] } | null;
      return event.clone({ body: { ...body, features: (body?.features ?? []).map(withFixture) } });
    }),
  );
};
