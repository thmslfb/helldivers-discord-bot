const { syncFromApi } = require('../../utils/sync-from-api');

module.exports = async (client) => {
  await syncFromApi(
    client,
    'dispatch_id',
    'dispatches',
    'last_dispatches',
    (item) => {
      const dispatchMatch = item.message.match(/<i=3>([^<]+)<\/i>/);
      const dispatchTitle = dispatchMatch ? dispatchMatch[1] : 'New Dispatch';

      const cleanMessage = item.message
        .replace(/<i=3>[^<]+<\/i>\n\n/, '')
        .replace(/<i=\d+>([^<]+)<\/i>/g, '**$1**');

      return {
        title: dispatchTitle,
        description: cleanMessage,
        url: null,
        color: 'fee34c',
      };
    }
  );
};
