import _ from 'lodash';
import TableModel from 'app/core/table_model';

class TestDataDatasource {
  id: any;

  /** @ngInject */
  constructor(instanceSettings, private backendSrv, private $q) {
    this.id = instanceSettings.id;
  }

  query(options) {
    const queries = _.filter(options.targets, item => {
      return item.hide !== true;
    }).map(item => {
      return {
        refId: item.refId,
        scenarioId: item.scenarioId,
        intervalMs: options.intervalMs,
        maxDataPoints: options.maxDataPoints,
        stringInput: item.stringInput,
        points: item.points,
        alias: item.alias,
        datasourceId: this.id,
      };
    });

    if (queries.length === 0) {
      return this.$q.when({ data: [] });
    }

    return this.backendSrv
      .datasourceRequest({
        method: 'POST',
        url: '/api/tsdb/query',
        data: {
          from: options.range.from.valueOf().toString(),
          to: options.range.to.valueOf().toString(),
          queries: queries,
        },
      })
      .then(res => {
        const data = [];

        if (res.data.results) {
          _.forEach(res.data.results, queryRes => {
            if (queryRes.tables) {
              for (const table of queryRes.tables) {
                const model = new TableModel();
                model.rows = table.rows;
                model.columns = table.columns;

                data.push(model);
              }
            }
            for (const series of queryRes.series) {
              data.push({
                target: series.name,
                datapoints: series.points,
              });
            }
          });
        }

        console.log(res);
        return { data: data };
      });
  }

  annotationQuery(options) {
    return this.backendSrv
      .datasourceRequest({
        method: 'POST',
        url: '/api/tsdb/query',
        data: {
          from: options.range.from.valueOf().toString(),
          to: options.range.to.valueOf().toString(),
          queries: [
            {
              refId: 'A',
              scenarioId: 'annotations',
              intervalMs: 100,
              maxDataPoints: 100,
              stringInput: '',
              datasourceId: this.id,
            },
          ],
        },
      })
      .then(resp => {
        console.log(resp);
        return [];
      });
  }
}

export { TestDataDatasource };
