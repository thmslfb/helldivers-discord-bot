require('dotenv').config();
const { Client } = require('discord.js');
const { CommandKit } = require('commandkit');

const client = new Client({
  intents: ['Guilds', 'GuildMessages', 'GuildMembers', 'MessageContent'],
});

new CommandKit({
  client,
  devGuildIds: [process.env.GUILD_ID],
  devUserIds: [process.env.USER_ID],
  devRoleIds: [process.env.ROLE_ID],
});

client.login(process.env.TOKEN);
