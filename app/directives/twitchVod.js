import { Player } from 'Twitch';
import requestInterval from 'request-interval';

import { strip } from '_utils/vodId';

export const NAME = 'twitchVod';

const DEFAULT_TICK_INTERVAL = 50;

let uniqId = 0;

const template = '<div class="c-twitch-vod embed-responsive embed-responsive-16by9"></div>';

/* @ngInject */
function directive() {
  return {
    template,
    restrict: 'E',
    scope: {
      video: '@',
      currentTime: '@',
      onCurrentTimeTick: '&',
      tickInterval: '@'
    },
    link(scope, iElm, iAttrs) {
      uniqId += 1;

      const playerDiv = iElm.find('div')[0];
      playerDiv.id = `twitch-vod-${uniqId}`;

      const player = new Player(playerDiv.id, {
        video: scope.video
      });

      const tickInterval = Number(scope.tickInterval || DEFAULT_TICK_INTERVAL);
      const intervalId = requestInterval(tickInterval, () => {
        scope.onCurrentTimeTick({
          $videoId: Number(strip(player.getVideo())),
          $seconds: Number(player.getCurrentTime())
        });
      });

      scope.$watch('currentTime', (val) => {
        if (val !== null) {
          player.seek(Number(val));
        }
      });

      iElm.on('$destroy', () => {
        requestInterval.clear(intervalId);
        player.destroy();
      });
    }
  };
}

export default function configure(ngModule) {
  ngModule.directive(NAME, directive);
}
