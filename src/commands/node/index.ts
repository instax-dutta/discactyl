import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import type { Command } from '../../types/discord';
import { errorEmbed } from '../../lib/embeds';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('node')
    .setDescription('Node monitoring commands')
    .addSubcommand(sub => sub.setName('list').setDescription('List all nodes'))
    .addSubcommand(sub => sub
      .setName('status')
      .setDescription('View node details')
      .addIntegerOption(opt => opt.setName('node_id').setDescription('Node ID').setRequired(true))),
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

export function registerNodeSubcommand(name: string, handler: (interaction: ChatInputCommandInteraction) => Promise<void>): void {
  subcommandHandlers.set(name, handler);
}

export default command;
