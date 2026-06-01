import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import type { Command } from '../../types/discord';
import { errorEmbed } from '../../lib/embeds';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('server')
    .setDescription('Server management commands')
    .addSubcommand(sub => sub
      .setName('list')
      .setDescription('List all Pterodactyl servers'))
    .addSubcommand(sub => sub
      .setName('status')
      .setDescription('View detailed server status')
      .addStringOption(opt => opt.setName('server').setDescription('Server ID or name').setRequired(true)))
    .addSubcommand(sub => sub
      .setName('start')
      .setDescription('Start a server')
      .addStringOption(opt => opt.setName('server').setDescription('Server ID').setRequired(true)))
    .addSubcommand(sub => sub
      .setName('stop')
      .setDescription('Stop a server')
      .addStringOption(opt => opt.setName('server').setDescription('Server ID').setRequired(true)))
    .addSubcommand(sub => sub
      .setName('restart')
      .setDescription('Restart a server')
      .addStringOption(opt => opt.setName('server').setDescription('Server ID').setRequired(true)))
    .addSubcommand(sub => sub
      .setName('kill')
      .setDescription('Force kill a server (admin only)')
      .addStringOption(opt => opt.setName('server').setDescription('Server ID').setRequired(true)))
    .addSubcommand(sub => sub
      .setName('create')
      .setDescription('Create a new server (admin only)'))
    .addSubcommand(sub => sub
      .setName('delete')
      .setDescription('Delete a server (admin only)')
      .addStringOption(opt => opt.setName('server').setDescription('Server ID').setRequired(true)))
    .addSubcommand(sub => sub
      .setName('console')
      .setDescription('Send a console command or view logs')
      .addStringOption(opt => opt.setName('server').setDescription('Server ID').setRequired(true))
      .addStringOption(opt => opt.setName('command').setDescription('Command to send (omit to view logs)').setRequired(false))
      .addIntegerOption(opt => opt.setName('lines').setDescription('Number of log lines (1-50)').setRequired(false).setMinValue(1).setMaxValue(50)))
    .addSubcommand(sub => sub
      .setName('backup')
      .setDescription('List or create backups')
      .addStringOption(opt => opt.setName('server').setDescription('Server ID').setRequired(true))
      .addStringOption(opt => opt.setName('action').setDescription('list or create').setRequired(true).addChoices(
        { name: 'list', value: 'list' }, { name: 'create', value: 'create' },
      ))
      .addStringOption(opt => opt.setName('name').setDescription('Backup name (create only)').setRequired(false))),
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

export function registerServerSubcommand(name: string, handler: (interaction: ChatInputCommandInteraction) => Promise<void>): void {
  subcommandHandlers.set(name, handler);
}

export default command;
