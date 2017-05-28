import createDocument from '_utils/createDocument';

export const NAME = 'getData';

/**
 * parse index data
 *
 * {
 *   link: {
 *     oldest, prev, next, latest
 *   }
 *   list: [
 *     {
 *       title, link, date, author, likes
 *     },
 *     ...
 *   ]
 * }
 */
function parseIndex(doc) {
  const $doc = $(doc);

  const $articles = $doc.find('.r-ent');
  const $pageLinks = $doc.find('#action-bar-container .btn-group-paging > a');

  const list = $articles.map(function () {
    const $this = $(this);
    return {
      title: $this.find('.title > a').text(),
      link: $this.find('.title > a').attr('href'),
      date: $this.find('.meta .date').text(),
      author: $this.find('.meta .author').text(),
      likes: $this.find('.nrec > span').text()
    };
  }).toArray();

  return {
    links: {
      oldest: $pageLinks.eq(0).attr('href'),
      previous: $pageLinks.eq(1).attr('href'),
      next: $pageLinks.eq(2).attr('href'),
      lastest: $pageLinks.eq(3).attr('href'),
    },
    list
  };
}

/**
 * parse article data
 *
 * {
 *   title, author, date, content
 * }
 */
function parseArticle(doc) {
  const $doc = $(doc);

  const $metaValues = $doc.find('.article-meta-value');

  // remove metas
  const $content = $doc.find('#main-content').clone();
  $content.find('.article-metaline, .article-metaline-right').remove();

  return {
    content: $.trim($content[0].innerText),
    author: $metaValues.eq(0).text(),
    title: $metaValues.eq(2).text(),
    date: $metaValues.eq(3).text()
  };
}

/* @ngInject */
function factory(getRawContent, $log) {
  const index = (url) => {
    return getRawContent(url)
    .then((res) => {
      const doc = createDocument(res.data);
      return parseIndex(doc);
    });
  };

  const article = (url) => {
    return getRawContent(url)
    .then((res) => {
      const doc = createDocument(res.data);
      return parseArticle(doc);
    });
  };

  return { index, article };
}

export default function configure(ngModule) {
  ngModule.factory(NAME, factory);
}
