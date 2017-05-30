import Chart from 'Chart';
import Lazy from 'lazy';

import maxBy from 'lodash/maxBy';
import each from 'lodash/each';

import { toTag } from '_utils/time';

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

const isDataReady = (data) => {
  return data.$resolved && data.meta && data.results;
};

/* @ngInject */
function directive(CHART_COLORS) {
  const alphaColor = (alpha) => {
    return color(CHART_COLORS.blue).lighten(0.2).alpha(alpha).rgbString();
  };

  return {
    template,
    restrict: 'E',
    scope: {
      width: '@',
      height: '@',
      data: '<',
      timeGroup: '@',
      onMousemove: '&',
      onClick: '&',
      onDrag: '&'
    },
    replace: true,
    link(scope, iElm, iAttrs) {
      const canvas = iElm[0];
      canvas.width = Number(scope.width);
      canvas.height = Number(scope.height);

      const ctx = canvas.getContext('2d');

      // console.log(formatData(scope.data));

      let fData;
      let chart;
      let timeGroup;
      let dragging = false;

      const chartOptions = {
        events: ['click', 'mousemove'],
        responsive: true,
        legend: {
          display: false
        },
        animation: {
          duration: 0, // general animation time
        },
        tooltips: {
          enabled: false,
          intersect: false,
          callbacks: {
            title(dataList) {
              const diff = timeGroup * dataList[0].index;
              const tag = toTag(diff);
              return tag;
            }
          }
        },
        scales: {
          xAxes: [{
            // type: 'time',
            display: false,
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
            display: false,
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
      };

      const retrieveTimeGroup = () => {
        const tg = scope.timeGroup;
        const { start, end } = scope.data.meta;
        return (!tg || tg === 'auto') ? (end - start) / 60 : Number(tg);
      };

      const createChart = () => {
        return new Chart(ctx, {
          type: 'line',
          data: {
            labels: fData.map((v, i) => i),
            datasets: [{
              label: '熱度',
              backgroundColor: alphaColor(0.7),
              borderColor: alphaColor(1),
              pointRadius: 0,
              borderWidth: 0.3,
              data: fData,
              // steppedLine: true
            }]
          },
          options: chartOptions
        });
      };

      scope.$watchCollection('data', (val) => {
        if (val && isDataReady(val)) {
          timeGroup = retrieveTimeGroup();
          fData = formatData(scope.data, timeGroup);
          chart = createChart();
        }
      });

      scope.$watch('timeGroup', (val, lastVal) => {
        if (val && val !== lastVal && chart) {
          timeGroup = retrieveTimeGroup();
          fData = formatData(scope.data, timeGroup);
          chart.data.labels = fData.map((v, i) => i);
          chart.data.datasets[0].data = fData;
          chart.update();
        }
      });

      const prepareEventData = ($evt, d) => {
        const frac = $evt.offsetX / canvas.width;

        const { start, end } = scope.data.meta;
        const seconds = (end - start) * frac;
        const point = d[Math.floor(d.length * frac)];

        return {
          $event: $evt,
          $seconds: seconds,
          $point: point
        };
      };

      iElm.on('mousedown', ($evt) => {
        if (!fData) {
          return;
        }

        dragging = true;
      });

      iElm.on('mouseup', ($evt) => {
        if (!fData) {
          return;
        }

        dragging = false;
      });

      iElm.on('mousemove', ($evt) => {
        if (!fData) {
          return;
        }

        const evtData = prepareEventData($evt, fData);

        if (dragging) {
          scope.onDrag(evtData);
        }
        else {
          scope.onMousemove(evtData);
        }
      });

      iElm.on('click', ($evt) => {
        if (!fData) {
          return;
        }

        scope.onClick(prepareEventData($evt, fData));
      });

      iElm.on('$destroy', () => {
        if (chart) {
          chart.destroy();
        }
      });
    }
  };
}

export default function configure(ngModule) {
  ngModule.directive(NAME, directive);
}
