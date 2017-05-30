import raf from 'raf';
import requestInterval from 'request-interval';

export const NAME = 'vodFloatingPanel';

const EVT_UPDATE = 'resize scroll DOMMouseScroll mousewheel';
const DEFAULT_ACTIVE_CLASS = 'c-vod-floating-panel--active';

/* @ngInject */
function directive() {
  return {
    restrict: 'A',
    link(scope, iElm, iAttrs) {
      const $win = $(window);
      let ticking = false;
      let activeClass = iAttrs.vfpActiveClass || DEFAULT_ACTIVE_CLASS;

      iAttrs.$observe('vfpActiveClass', (val) => {
        if (val) {
          activeClass = val;
        }
      });

      function _updateStyle() {
        const elmHeight = iElm.height();

        const $vod = $('.c-twitch-vod');
        const vodBottomY = $vod.offset().top + $vod[0].offsetHeight;

        const bottom = Math.max(
          0,
          ($win.scrollTop() + $win.height()) - (elmHeight + vodBottomY)
        );

        iElm.toggleClass(activeClass, bottom === 0);
        iElm.css('bottom', bottom);
      }

      function updateStyle() {
        if (ticking) {
          return;
        }
        raf(() => {
          _updateStyle();
          ticking = false;
        });
      }

      $win.on(EVT_UPDATE, updateStyle);
      updateStyle();

      const intervalId = requestInterval(200, updateStyle);

      iElm.on('$destroy', () => {
        requestInterval.clear(intervalId);
        $win.off(EVT_UPDATE, updateStyle);
      });
    }
  };
}

export default function configure(ngModule) {
  ngModule.directive(NAME, directive);
}
