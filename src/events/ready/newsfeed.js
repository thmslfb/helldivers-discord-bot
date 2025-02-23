const { syncFromApi } = require('../../utils/sync-from-api');

module.exports = async (client) => {
  await syncFromApi(
    client,
    'newsfeed_id',
    'steam',
    'last_newsfeeds',
    (item) => {
      const cleanMessage = item.content
        .replace(/\[h1\](.*?)\[\/h1\]/g, '# $1')
        .replace(/\[h2\](.*?)\[\/h2\]/g, '## $1')
        .replace(/\[b\](.*?)\[\/b\]/g, '**$1**')
        .replace(/\[list\]/g, '')
        .replace(/\[\/list\]/g, '')
        .replace(/\[\*\]/g, '- ');

      return {
        title: item.title,
        description: cleanMessage,
        url: item.url,
        color: '607d8b',
      };
    }
  );
};
