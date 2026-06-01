import { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextInputBuilder, TextInputStyle, ModalBuilder } from 'discord.js';
import { applicationClient } from '../../lib/pterodactyl/application';
import { requireRole } from '../../lib/permissions';
import { infoEmbed, errorEmbed, successEmbed } from '../../lib/embeds';
import { addAuditLog } from '../../lib/db/audit-log';
import { registerServerSubcommand } from './index';

registerServerSubcommand('create', async (interaction) => {
  const { allowed, role } = requireRole('admin')(interaction.member as any);
  if (!allowed || role !== 'admin') {
    await interaction.reply({ embeds: [infoEmbed('Permission Denied', 'Only admins can create servers.')], ephemeral: true });
    return;
  }

  try {
    const { users } = await applicationClient.listUsers(1);
    const { nodes } = await applicationClient.listNodes(1);

    if (users.length === 0) {
      await interaction.reply({ embeds: [errorEmbed('No Users', 'Create a user first.')], ephemeral: true });
      return;
    }
    if (nodes.length === 0) {
      await interaction.reply({ embeds: [errorEmbed('No Nodes', 'No nodes available.')], ephemeral: true });
      return;
    }

    const modal = new ModalBuilder()
      .setCustomId('modal:create-server')
      .setTitle('Create Server');

    const nameInput = new TextInputBuilder()
      .setCustomId('name').setLabel('Server Name').setStyle(TextInputStyle.Short).setRequired(true).setMinLength(1).setMaxLength(100);
    const userInput = new TextInputBuilder()
      .setCustomId('user_id').setLabel(`User ID (1-${users.length})`).setStyle(TextInputStyle.Short).setRequired(true);
    const memoryInput = new TextInputBuilder()
      .setCustomId('memory').setLabel('Memory (MB)').setStyle(TextInputStyle.Short).setRequired(true).setValue('1024');
    const diskInput = new TextInputBuilder()
      .setCustomId('disk').setLabel('Disk (MB)').setStyle(TextInputStyle.Short).setRequired(true).setValue('4096');
    const cpuInput = new TextInputBuilder()
      .setCustomId('cpu').setLabel('CPU Limit (%)').setStyle(TextInputStyle.Short).setRequired(true).setValue('100');

    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(userInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(memoryInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(diskInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(cpuInput),
    );

    await interaction.showModal(modal);
  } catch (err: any) {
    await interaction.reply({ embeds: [errorEmbed('Error', `Failed to load data: ${err.message}`)], ephemeral: true });
  }
});
