const {
  SlashCommandBuilder,
  MessageFlags,
  EmbedBuilder,
} = require('discord.js');

const slotIcons = {
  Head: '<:helmet:1340369850031276092>',
  Body: '<:body:1340369834533326930>',
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('superstore')
    .setDescription('Get the current Superstore rotation.'),
  run: async ({ interaction }) => {
    await interaction.deferReply({
      flags: MessageFlags.Ephemeral,
    });

    try {
      const response = await fetch(
        `${process.env.DIVEHARDER_API_URL}/store_rotation`
      );

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();

      if (data.items.every((item) => item.name === 'Unmapped: NO STORE DATA')) {
        await interaction.editReply({
          content: 'No store data available at the moment.',
        });
        return;
      }

      const date = new Date(`${data.expire_time} GMT`);
      const rotationTime = Math.floor(date / 1000);
      const timeRemaining = rotationTime - Math.floor(Date.now() / 1000);
      const warningIcon = timeRemaining < 86400 ? ':warning:' : '';

      const embed = new EmbedBuilder()
        .setTitle('Superstore Rotation')
        .setDescription(`Rotate <t:${rotationTime}:R> ${warningIcon}`)
        .setColor('3498db');

      data.items.forEach((item, index) => {
        const slotIcon = slotIcons[item.slot] || '';

        const type = item.slot === 'Head' ? '' : `Type: **${item.type}**`;
        const passive =
          item.passive.name === 'Standard Issue'
            ? ''
            : `**${item.passive.name}**`;
        const passiveDescription =
          item.passive.description === 'No additional bonuses.'
            ? ''
            : `-# - ${item.passive.description}`;

        const fieldValue = [
          type,
          `Slot: **${item.slot}** ${slotIcon}`,
          `Armor: **${item.armor_rating}**`,
          `Speed: **${item.speed}**`,
          `Stamina Regen: **${item.stamina_regen}**`,
          passive,
          passiveDescription,
        ]
          .filter(Boolean)
          .join('\n');

        embed.addFields({
          name: `${item.name} - ${item.store_cost} <:super_credits:1340358881146306563>`,
          value: fieldValue,
          inline: true,
        });

        if (index % 2 === 0) {
          embed.addFields({
            name: '\u2800',
            value: '\u2800',
            inline: true,
          });
        }
      });

      await interaction.editReply({
        embeds: [embed],
      });
    } catch (error) {
      console.error(`Error getting Superstore rotation: ${error.message}`);
      await interaction.editReply({
        content: 'Unable to fetch Superstore rotation. Please try again later.',
      });
    }
  },
  options: {
    // devOnly: true,
    // deleted: true,
  },
};
