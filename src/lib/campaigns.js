const { syncFromApi } = require('./sync-from-api');

module.exports = async (client) => {
  await syncFromApi(
    client,
    'campaign_id',
    'campaigns',
    'last_campaigns',
    (item) => {
      const planetName = item.planet.name;
      const eventData = item.planet.event;

      const factionIcons = {
        Illuminate: '<:illuminate:1344047206394495051>',
        Automaton: '<:automaton:1344048603932393472>',
        Terminids: '<:terminid:1344048588686102619>',
      };

      const factionIcon = eventData
        ? factionIcons[item.planet.event.faction]
        : factionIcons[item.planet.currentOwner];

      const event = !eventData
        ? `⚔️ Liberate ${planetName} ${factionIcon}`
        : `🛡️ ${
            eventData.eventType === 1 ? 'Defend' : 'Repel the invasion on'
          } ${planetName} ${factionIcon}`;

      const planetHealth =
        eventData && eventData.maxHealth ? eventData.maxHealth : 0;
      const invasionLevel = Math.floor(planetHealth / 50000);

      const timeRemaining = eventData
        ? Math.floor(new Date(item.planet.event.endTime).getTime() / 1000)
        : null;

      const description = eventData
        ? `**New campaigns**
${event}
>>> -# Invasion level **${invasionLevel}**
*Ends <t:${timeRemaining}:R>*`
        : `**New campaigns**
${event}`;

      return {
        title:
          '<:left_banner:1344035791483174955> Galactic War Updates <:right_banner:1344035811053797426>',
        description,
        url: null,
        color: 'ed4245',
      };
    },
    'last'
  );
};
