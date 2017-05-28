import Chart from 'Chart';
import Lazy from 'lazy';
import moment from 'moment';

import maxBy from 'lodash/maxBy';
import countBy from 'lodash/countBy';
import each from 'lodash/each';

export const NAME = 'chart';

const color = Chart.helpers.color;

const template = '<canvas></canvas>';

const formatData = (rawData, timeGroup = 60) => {
  const { meta, results } = rawData;

  const gData = {};
  each(results, (v, k) => {
    const g = Math.floor(k / timeGroup);

    if (typeof gData[g] === 'undefined') {
      gData[g] = 0;
    }
    else {
      gData[g] += v;
    }
  });

  const start = +new Date(meta.start * 1000);
  const m = maxBy(Object.keys(gData), v => Number(v));
  return Lazy.range(Number(m) + 1)
  .map((i) => {
    return {
      x: new Date(start + (i * 1000 * timeGroup)),
      y: gData[i] || 0
    };
  })
  .toArray();
};

/* @ngInject */
function directive(CHART_COLORS) {
  const alphaGreen = (alpha) => {
    return color(CHART_COLORS.green).alpha(alpha).rgbString();
  };

  return {
    template,
    restrict: 'E',
    scope: {
      data: '<',
      width: '<',
      height: '<'
    },
    replace: true,
    link(scope, iElm, iAttrs) {
      const canvas = iElm[0];
      canvas.width = Number(scope.width);
      canvas.height = Number(scope.height);

      const ctx = canvas.getContext('2d');

      // console.log(formatData(scope.data));

      scope.$watchCollection('data', (val) => {
        if (val && val.$resolved && val.meta && val.results) {
          const timeGroup = (val.meta.end - val.meta.start) / 60;
          // const data = formatData(scope.data, timeGroup);
          const data = formatData(scope.data, timeGroup);
          const chart = new Chart(ctx, {
            type: 'line',
            data: {
              datasets: [{
                label: '熱度',
                backgroundColor: alphaGreen(0.2),
                borderColor: alphaGreen(0.5),
                pointRadius: 0,
                borderWidth: 1,
                data
              }]
            },
            options: {
              responsive: true,
              legend: {
                display: false
              },
              animation: {
                duration: 0, // general animation time
              },
              tooltips: {
                intersect: false,
                callbacks: {
                  title(dataList) {
                    const d = dataList[0].xLabel;
                    return moment(d).format('HH:mm');
                  }
                }
              },
              scales: {
                // xAxes: [{
                //   type: 'time',
                //   position: 'bottom'
                // }]
                xAxes: [{
                  type: 'time',
                  display: true,
                  scaleLabel: {
                    display: true,
                    labelString: '時間'
                  },
                  ticks: {
                    display: false
                  },
                  gridLines: {
                    display: false
                  }
                }],
                yAxes: [{
                  display: true,
                  scaleLabel: {
                    display: true,
                    labelString: '熱度'
                  },
                  ticks: {
                    display: false
                  },
                  gridLines: {
                    display: false
                  }
                }]
              }
            }
          });

          iElm.on('$destroy', () => {
            chart.destroy();
          });
        }
      });
    }
  };
}

export default function configure(ngModule) {
  ngModule.directive(NAME, directive);
}
