const { syncFromApi } = require('./sync-from-api');

module.exports = async (client) => {
  await syncFromApi(
    client,
    'planet_index',
    'planets',
    'planets_data',
    async (currentPlanet, previousPlanet) => {
      try {
        if (
          !currentPlanet ||
          currentPlanet.index === undefined ||
          currentPlanet.index === null
        ) {
          console.warn('Received planet without index:', currentPlanet);
          return null;
        }

        if (!previousPlanet) return null;

        const factionIcons = {
          Illuminate: '<:illuminate:1344047206394495051>',
          Automaton: '<:automaton:1344048603932393472>',
          Terminids: '<:terminid:1344048588686102619>',
          Humans: '<:human:1345739388046544977>',
        };

        const humanIcon = factionIcons.Humans;

        const hadEvent = !!previousPlanet.event;
        const hasEvent = !!currentPlanet.event;

        if (hadEvent && !hasEvent) {
          const eventType =
            previousPlanet.event.eventType === 1 ? 'defense' : 'invasion';
          const enemyFaction = previousPlanet.event.faction;
          const enemyIcon = factionIcons[enemyFaction] || '';

          if (previousPlanet.currentOwner !== currentPlanet.currentOwner) {
            if (currentPlanet.currentOwner === 'Humans') {
              return {
                title:
                  '<:left_banner:1344035791483174955> Galactic War Updates <:right_banner:1344035811053797426>',
                description: `**Campaign victories**\n <:victory:1345739176473006122> ${currentPlanet.name} has been liberated from the ${previousPlanet.currentOwner} ${enemyIcon}`,
                color: 'ed4245',
              };
            } else if (previousPlanet.currentOwner === 'Humans') {
              return {
                title:
                  '<:left_banner:1344035791483174955> Galactic War Updates <:right_banner:1344035811053797426>',
                description: `**Planet lost**\n 💀 **${
                  currentPlanet.name
                }** has been lost to the ${currentPlanet.currentOwner} ${
                  factionIcons[currentPlanet.currentOwner] || ''
                }`,
                color: 'ed4245',
              };
            }
          } else {
            if (
              eventType === 'defense' &&
              currentPlanet.currentOwner === 'Humans'
            ) {
              return {
                title:
                  '<:left_banner:1344035791483174955> Galactic War Updates <:right_banner:1344035811053797426>',
                description: `**Campaign victories**\n <:victory:1345739176473006122> **${currentPlanet.name}** has been successfully defended`,
                color: 'ed4245',
              };
            }

            const eventEndedEarly =
              previousPlanet.event.endTime &&
              new Date(previousPlanet.event.endTime) > new Date();

            if (
              eventType === 'invasion' &&
              currentPlanet.currentOwner === 'Humans' &&
              eventEndedEarly
            ) {
              const endTime = new Date(previousPlanet.event.endTime);
              const now = new Date();
              const hoursRemaining = (
                (endTime - now) /
                (1000 * 60 * 60)
              ).toFixed(2);

              return {
                title:
                  '<:left_banner:1344035791483174955> Galactic War Updates <:right_banner:1344035811053797426>',
                description: `**Invasions**\n The invasion on ${currentPlanet.name} has ended ${humanIcon}\n
-# The Helldivers have __successfully pushed back the ${enemyFaction}__ ${enemyIcon} with ${hoursRemaining} hours remaining`,
                color: 'ed4245',
              };
            }

            return {
              title:
                '<:left_banner:1344035791483174955> Galactic War Updates <:right_banner:1344035811053797426>',
              description: `**Invasions**\n The ${eventType} on ${currentPlanet.name} has ended ${humanIcon}\n
-# The ${enemyFaction} have left and __no territory has changed ownership__ ${enemyIcon}`,
              color: 'ed4245',
            };
          }
        }

        if (
          previousPlanet.currentOwner !== currentPlanet.currentOwner &&
          !hadEvent &&
          !hasEvent
        ) {
          console.log(
            `Changement de propriétaire sans événement pour ${currentPlanet.name}: ${previousPlanet.currentOwner} -> ${currentPlanet.currentOwner}`
          );

          const enemyIcon = factionIcons[previousPlanet.currentOwner] || '';

          if (
            currentPlanet.currentOwner === 'Humans' &&
            previousPlanet.currentOwner !== 'Humans'
          ) {
            return {
              title:
                '<:left_banner:1344035791483174955> Galactic War Updates <:right_banner:1344035811053797426>',
              description: `**Campaign victories**\n <:victory:1345739176473006122> ${currentPlanet.name} has been liberated from the ${previousPlanet.currentOwner} ${enemyIcon}`,
              color: 'ed4245',
            };
          } else if (
            previousPlanet.currentOwner === 'Humans' &&
            currentPlanet.currentOwner !== 'Humans'
          ) {
            return {
              title:
                '<:left_banner:1344035791483174955> Galactic War Updates <:right_banner:1344035811053797426>',
              description: `**Planet lost**\n 💀 **${
                currentPlanet.name
              }** has been lost to the ${currentPlanet.currentOwner} ${
                factionIcons[currentPlanet.currentOwner] || ''
              }`,
              color: 'ed4245',
            };
          }
        }

        return null;
      } catch (error) {
        console.error(
          `Erreur lors du traitement de la planète ${
            currentPlanet?.name || currentPlanet?.index
          }: ${error}`
        );
        return null;
      }
    },
    'all'
  );
};
