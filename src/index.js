require('dotenv').config();
const { Client } = require('discord.js');

const client = new Client({
  intents: ['Guilds', 'GuildMessages', 'GuildMembers', 'MessageContent'],
});

client.on('ready', (c) => {
  console.log(`✅ ${c.user.tag} is online!`);
});

client.login(process.env.TOKEN);
