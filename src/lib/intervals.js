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

const scheduleCampaigns = async (client) => {
  console.log(`🛡️ Campaigns triggered at ${new Date().toLocaleTimeString()}`);
  try {
    await campaigns(client);
  } catch (error) {
    console.error(`❌ Error in newsfeed: ${error.message}`);
  }
  setTimeout(() => scheduleCampaigns(client), 10 * 60 * 1000); // 10 minutes
};

const schedulePlanets = async (client) => {
  console.log(`🪐 Planets triggered at ${new Date().toLocaleTimeString()}`);
  try {
    await planets(client);
  } catch (error) {
    console.error(`❌ Error in planets: ${error.message}`);
  }
  setTimeout(() => schedulePlanets(client), 10 * 60 * 1000); // 10 minutes
};

const startIntervals = (client) => {
  console.log('⏳ Intervals started');
  scheduleDispatches(client);
  scheduleNewsfeeds(client);
  scheduleCampaigns(client);
  schedulePlanets(client);
  setTimeout(() => schedulePlanets(client), 200); // Start planets 200 ms after campaigns
};

module.exports = { startIntervals };
