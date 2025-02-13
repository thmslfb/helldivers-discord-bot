const { EmbedBuilder } = require('discord.js');

const KeywordCache = require('../../utils/keyword-cache');
const cache = new KeywordCache();

module.exports = async (message) => {
  if (message.author.bot) return;

  const messageContent = message.content.toLowerCase();

  if (cache.testMessage(messageContent)) {
    try {
      await message.delete();

      const embed = new EmbedBuilder()
        .setTitle('INFRACTION DETECTED!')
        .setDescription(
          'Your nearest Democracy Enforcement Officer has been notified of this infraction and will be with you shortly.'
        )
        .setColor('ff4545')
        .setFooter({ text: `Reported user: ${message.author.tag}` });

      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(`Error handling democracy infraction: ${error}`);
    }
  }
};
