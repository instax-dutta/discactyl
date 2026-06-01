import { Events } from 'discord.js';
import { logger } from '../lib/logger';

export default {
  name: 'error' as const,
  execute(error: Error) {
    logger.error({ err: error }, 'Discord client error');
  },
};
