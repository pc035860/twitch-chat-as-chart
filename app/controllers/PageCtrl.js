export const NAME = 'PageCtrl';

function getPttUrl(board, page) {
  return `https://www.ptt.cc/bbs/${board}/${page}`;
}

class PageCtrl {
  __deps;
  IS_INDEX;
  IS_ARTICLE;
  data;

  /* @ngInject */
  constructor(
    $log, getData, $state, $scope, $rootScope, $window
  ) {
    this.__deps = { $log, $window };
    this.data = {
      index: null,
      article: null
    };

    $scope.$watch(() => $state.params, (val) => {
      this.IS_INDEX = this._isIndexPage(val.page);
      this.IS_ARTICLE = !this.IS_INDEX;

      const { board, page } = val;

      if (this.IS_INDEX) {
        getData.index(getPttUrl(board, page))
        .then(data => this.data.index = data);
        this.data.article = null;
        $rootScope.$broadcast('modal', false);
      }
      else {
        getData.article(getPttUrl(board, page))
        .then((data) => {
          this.data.article = data;
          $rootScope.$broadcast('modal', true);
        });

        if (!this.data.index) {
          getData.index(getPttUrl(board, 'index.html'))
          .then(data => this.data.index = data);
        }
      }
    });
  }

  closeArticle() {
    const { $window } = this.__deps;

    $window.history.back();
  }

  _isIndexPage(page) {
    return /^index([\d]+)?\.html$/i.test(page);
  }
}

export default function configure(ngModule) {
  ngModule.controller(NAME, PageCtrl);
}
