import type { Command } from './discord';
import { Collection } from 'discord.js';

declare module 'discord.js' {
  interface Client {
    commands: Collection<string, Command>;
  }
}
