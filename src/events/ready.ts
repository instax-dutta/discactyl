import { Events, Client, REST, Routes } from 'discord.js';
import { logger } from '../lib/logger';
import { env } from '../config/env';
import serverCommand from '../commands/server/index';
import userCommand from '../commands/user/index';
import nodeCommand from '../commands/node/index';
import accountCommand from '../commands/account/index';
import configCommand from '../commands/config/index';

const commands = [
  serverCommand.data.toJSON(),
  userCommand.data.toJSON(),
  nodeCommand.data.toJSON(),
  accountCommand.data.toJSON(),
  configCommand.data.toJSON(),
];

async function registerCommands(clientId: string) {
  const rest = new REST({ version: '10' }).setToken(env.DISCORD_TOKEN);
  if (env.DISCORD_GUILD_ID) {
    await rest.put(Routes.applicationGuildCommands(clientId, env.DISCORD_GUILD_ID), { body: commands });
    logger.info({ guildId: env.DISCORD_GUILD_ID }, 'Guild slash commands registered');
  } else {
    await rest.put(Routes.applicationCommands(clientId), { body: commands });
    logger.info('Global slash commands registered (up to 1 hour to propagate)');
  }
}

export default {
  name: Events.ClientReady,
  once: true,
  execute(client: Client<true>) {
    logger.info({ user: client.user?.tag }, 'Bot is ready');
    client.user?.setActivity('Pterodactyl Panel', { type: 3 });
    registerCommands(client.user.id).catch(err =>
      logger.error({ err }, 'Failed to register slash commands'),
    );
  },
};
