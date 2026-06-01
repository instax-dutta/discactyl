import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import type { Command } from '../../types/discord';
import { errorEmbed } from '../../lib/embeds';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('account')
    .setDescription('Link or manage your Pterodactyl account')
    .addSubcommand(sub => sub
      .setName('link')
      .setDescription('Link your Discord account to Pterodactyl')
      .addStringOption(opt => opt.setName('api_key').setDescription('Your Pterodactyl Client API key').setRequired(true)))
    .addSubcommand(sub => sub.setName('unlink').setDescription('Unlink your Pterodactyl account'))
    .addSubcommand(sub => sub.setName('view').setDescription('View your linked account info')),
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

export function registerAccountSubcommand(name: string, handler: (interaction: ChatInputCommandInteraction) => Promise<void>): void {
  subcommandHandlers.set(name, handler);
}

export default command;
