const dispatches = require('./dispatches');
const newsfeeds = require('./newsfeeds');
const campaigns = require('./campaigns');

const scheduleDispatches = async (client) => {
  console.log(`📡 Dispatches triggered at ${new Date().toLocaleTimeString()}`);
  try {
    await dispatches(client);
  } catch (error) {
    console.error(`❌ Error in dispatches: ${error.message}`);
  }
  setTimeout(() => scheduleDispatches(client), 5 * 60 * 1000); // 5 minutes
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
  setTimeout(() => scheduleCampaigns(client), 5 * 60 * 1000); // 5 minutes
};

const startIntervals = (client) => {
  console.log('⏳ Intervals started');
  scheduleDispatches(client);
  scheduleNewsfeeds(client);
  scheduleCampaigns(client);
};

module.exports = { startIntervals };
