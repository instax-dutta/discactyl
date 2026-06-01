import { Events, Client } from 'discord.js';
import { logger } from '../lib/logger';

export default {
  name: Events.ClientReady,
  once: true,
  execute(client: Client<true>) {
    logger.info({ user: client.user?.tag }, 'Bot is ready');
    client.user?.setActivity('Pterodactyl Panel', { type: 3 });
  },
};
