const dispatches = require('../events/ready/dispatches');
const newsfeed = require('../events/ready/newsfeed');

let isFirstRun = {
  dispatches: true,
  newsfeed: true,
};

const scheduleDispatches = async (client) => {
  console.log(`📡 Dispatches triggered at ${new Date().toLocaleTimeString()}`);
  try {
    if (isFirstRun.dispatches) {
      isFirstRun.dispatches = false;
    } else {
      await dispatches(client);
    }
  } catch (error) {
    console.error(`❌ Error in dispatches: ${error.message}`);
  }
  setTimeout(() => scheduleDispatches(client), 5 * 60 * 1000); // 5 minutes
};

const scheduleNewsfeed = async (client) => {
  console.log(`📢 Newsfeed triggered at ${new Date().toLocaleTimeString()}`);
  try {
    if (isFirstRun.newsfeed) {
      isFirstRun.newsfeed = false;
    } else {
      await newsfeed(client);
    }
  } catch (error) {
    console.error(`❌ Error in newsfeed: ${error.message}`);
  }
  setTimeout(() => scheduleNewsfeed(client), 10 * 60 * 1000); // 10 minutes
};

const startIntervals = (client) => {
  console.log('⏳ Intervals started');
  scheduleDispatches(client);
  scheduleNewsfeed(client);
};

module.exports = { startIntervals };
