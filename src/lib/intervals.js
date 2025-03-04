const dispatches = require('./dispatches');
const newsfeeds = require('./newsfeeds');
const campaigns = require('./campaigns');
const planets = require('./planets');

const scheduleDispatches = async (client) => {
  console.log(`📡 Dispatches triggered at ${new Date().toLocaleTimeString()}`);
  try {
    await dispatches(client);
  } catch (error) {
    console.error(`❌ Error in dispatches: ${error.message}`);
  }
  setTimeout(() => scheduleDispatches(client), 10 * 60 * 1000); // 5 minutes
};

const scheduleNewsfeeds = async (client) => {
  console.log(`📢 Newsfeeds triggered at ${new Date().toLocaleTimeString()}`);
  try {
    await newsfeeds(client);
  } catch (error) {
    console.error(`❌ Error in newsfeed: ${error.message}`);
  }
  setTimeout(() => scheduleNewsfeeds(client), 10 * 60 * 1000); // 10 minutes
};

const schedulePlanetsAndCampaigns = async (client) => {
  setTimeout(() => schedulePlanetsAndCampaigns(client), 10 * 60 * 1000); // 10 minutes

  console.log(`🪐🛡️ Combined update at ${new Date().toLocaleTimeString()}`);
  try {
    console.log(`🪐 Planets triggered at ${new Date().toLocaleTimeString()}`);
    await planets(client);
    console.log(`🛡️ Campaigns triggered at ${new Date().toLocaleTimeString()}`);
    await campaigns(client);
  } catch (error) {
    console.error(`❌ Error in planets-campaigns sequence: ${error.message}`);
  }
};

const startIntervals = (client) => {
  console.log('⏳ Intervals started');
  scheduleDispatches(client);
  scheduleNewsfeeds(client);
  schedulePlanetsAndCampaigns(client);
};

module.exports = { startIntervals };
