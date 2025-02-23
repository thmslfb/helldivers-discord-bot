const dispatches = require('./dispatches');
const newsfeed = require('./newsfeed');

const scheduleDispatches = async (client) => {
  console.log(`📡 Dispatches triggered at ${new Date().toLocaleTimeString()}`);
  try {
    await dispatches(client);
  } catch (error) {
    console.error(`❌ Error in dispatches: ${error.message}`);
  }
  setTimeout(() => scheduleDispatches(client), 5 * 60 * 1000); // 5 minutes
};

const scheduleNewsfeed = async (client) => {
  console.log(`📢 Newsfeed triggered at ${new Date().toLocaleTimeString()}`);
  try {
    await newsfeed(client);
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
