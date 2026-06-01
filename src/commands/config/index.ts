import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import type { Command } from '../../types/discord';
import { errorEmbed } from '../../lib/embeds';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('Bot configuration')
    .addSubcommand(sub => sub.setName('view').setDescription('View current guild configuration'))
    .addSubcommand(sub => sub
      .setName('set-admin-role')
      .setDescription('Set the admin role for bot commands')
      .addRoleOption(opt => opt.setName('role').setDescription('Discord role').setRequired(true)))
    .addSubcommand(sub => sub
      .setName('set-operator-role')
      .setDescription('Set the operator role for bot commands')
      .addRoleOption(opt => opt.setName('role').setDescription('Discord role').setRequired(true)))
    .addSubcommand(sub => sub
      .setName('set-viewer-role')
      .setDescription('Set the viewer role for bot commands')
      .addRoleOption(opt => opt.setName('role').setDescription('Discord role').setRequired(true))),
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

export function registerConfigSubcommand(name: string, handler: (interaction: ChatInputCommandInteraction) => Promise<void>): void {
  subcommandHandlers.set(name, handler);
}

export default command;
