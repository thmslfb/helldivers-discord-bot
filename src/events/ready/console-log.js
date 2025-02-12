const { ActivityType } = require('discord.js');

module.exports = (c, client) => {
  console.log(`✅ ${c.user.tag} is online!`);

  client.user.setActivity({
    name: 'Spreading Democracy',
    type: ActivityType.Playing,
  });
};
