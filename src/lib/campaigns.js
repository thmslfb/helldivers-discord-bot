const { syncFromApi } = require('./sync-from-api');

module.exports = async (client) => {
  await syncFromApi(
    client,
    'campaign_id',
    'campaigns',
    'last_campaigns',
    (item) => {
      const planetName = item.planet.name;

      const event =
        item.planet.event.eventType === 1 ? 'Defend' : 'Repel the invasion on';

      const planetHealth = item.planet.event.maxHealth;
      const invasionLevel = Math.floor(planetHealth / 50000);

      const timeRemaining = Math.floor(
        new Date(item.planet.event.endTime).getTime() / 1000
      );

      const factionIcons = {
        Illuminate: '<:illuminate:1344047206394495051>',
        Automaton: '<:automaton:1344048603932393472>',
        Terminids: '<:terminid:1344048588686102619>',
      };

      const factionIcon = factionIcons[item.planet.event.faction];

      return {
        title:
          '<:left_banner:1344035791483174955> Galactic War Updates <:right_banner:1344035811053797426>',
        description: `**New campaigns**
🛡️ ${event} ${planetName} ${factionIcon}
>>> -# Invasion level **${invasionLevel}**
*Ends <t:${timeRemaining}:R>*`,
        url: null,
        footer: null,
        color: 'ed4245',
      };
    },
    'last'
  );
};
