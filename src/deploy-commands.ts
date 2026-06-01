import { REST, Routes } from 'discord.js';
import { env } from './config/env';
import { logger } from './lib/logger';

import serverCommand from './commands/server/index';
import userCommand from './commands/user/index';
import nodeCommand from './commands/node/index';
import accountCommand from './commands/account/index';
import configCommand from './commands/config/index';

const commands = [
  serverCommand.data.toJSON(),
  userCommand.data.toJSON(),
  nodeCommand.data.toJSON(),
  accountCommand.data.toJSON(),
  configCommand.data.toJSON(),
];

const rest = new REST({ version: '10' }).setToken(env.DISCORD_TOKEN);

async function deploy() {
  try {
    logger.info({ count: commands.length }, 'Registering commands');

    const isGuild = process.argv.includes('--guild') && env.DISCORD_GUILD_ID;

    if (isGuild) {
      await rest.put(
        Routes.applicationGuildCommands(env.DISCORD_CLIENT_ID, env.DISCORD_GUILD_ID),
        { body: commands },
      );
      logger.info({ guildId: env.DISCORD_GUILD_ID }, 'Guild commands registered');
    } else {
      await rest.put(
        Routes.applicationCommands(env.DISCORD_CLIENT_ID),
        { body: commands },
      );
      logger.info('Global commands registered (may take up to 1 hour to propagate)');
    }
  } catch (err) {
    logger.error({ err }, 'Command registration failed');
    process.exit(1);
  }
}

deploy();
