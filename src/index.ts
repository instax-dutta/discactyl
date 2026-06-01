import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { env } from './config/env';
import { logger } from './lib/logger';
import { getDb } from './lib/db/index';
import { runMigrations } from './lib/db/migrate';
import type { Command } from './types/discord';

runMigrations(getDb());

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
}) as Client & { commands: Collection<string, Command> };

client.commands = new Collection<string, Command>();

import serverCommand from './commands/server/index';
import userCommand from './commands/user/index';
import nodeCommand from './commands/node/index';
import accountCommand from './commands/account/index';
import configCommand from './commands/config/index';

client.commands.set(serverCommand.data.name, serverCommand);
client.commands.set(userCommand.data.name, userCommand);
client.commands.set(nodeCommand.data.name, nodeCommand);
client.commands.set(accountCommand.data.name, accountCommand);
client.commands.set(configCommand.data.name, configCommand);

import './commands/server/list';
import './commands/server/status';
import './commands/server/power';
import './commands/server/create';
import './commands/server/delete';
import './commands/server/console';
import './commands/server/backup';
import './commands/user/list';
import './commands/user/create';
import './commands/user/delete';
import './commands/node/list';
import './commands/node/status';
import './commands/account/account';
import './commands/config/view';
import './commands/config/set';

import './components/buttons/power-action';
import './components/buttons/pagination';
import './components/modals/create-server';
import './components/modals/confirm-delete';
import './components/modals/confirm-kill';
import './components/modals/create-user';

import readyEvent from './events/ready';
import interactionCreateEvent from './events/interactionCreate';
import errorEvent from './events/error';

client.on(readyEvent.name as any, (...args: any[]) => (readyEvent as any).execute(...args));
client.on(interactionCreateEvent.name as any, (...args: any[]) => (interactionCreateEvent as any).execute(...args));
client.on(errorEvent.name, (...args: any[]) => (errorEvent as any).execute(...args));

client.login(env.DISCORD_TOKEN).catch((err) => {
  logger.error({ err }, 'Failed to login');
  process.exit(1);
});

process.on('SIGINT', () => {
  logger.info('Shutting down');
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Shutting down');
  client.destroy();
  process.exit(0);
});
