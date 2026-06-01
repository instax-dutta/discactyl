import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import type { Command } from '../../types/discord';
import { errorEmbed } from '../../lib/embeds';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('user')
    .setDescription('Pterodactyl user management')
    .addSubcommand(sub => sub.setName('list').setDescription('List all Pterodactyl users'))
    .addSubcommand(sub => sub.setName('create').setDescription('Create a new Pterodactyl user'))
    .addSubcommand(sub => sub
      .setName('delete')
      .setDescription('Delete a Pterodactyl user')
      .addStringOption(opt => opt.setName('user').setDescription('Username or ID').setRequired(true))),
  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    const handler = subcommandHandlers.get(subcommand);
    if (!handler) {
      await interaction.reply({ embeds: [errorEmbed('Unknown Command', `Unknown subcommand: ${subcommand}`)], ephemeral: true });
      return;
    }
    await handler(interaction);
  },
};

const subcommandHandlers = new Map<string, (interaction: ChatInputCommandInteraction) => Promise<void>>();

export function registerUserSubcommand(name: string, handler: (interaction: ChatInputCommandInteraction) => Promise<void>): void {
  subcommandHandlers.set(name, handler);
}

export default command;
