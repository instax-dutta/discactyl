import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { requireRole } from '../../lib/permissions';
import { infoEmbed, errorEmbed } from '../../lib/embeds';
import { registerUserSubcommand } from './index';

registerUserSubcommand('create', async (interaction) => {
  const { allowed } = requireRole('admin')(interaction.member as any);
  if (!allowed) {
    await interaction.reply({ embeds: [infoEmbed('Permission Denied', 'Only admins can create users.')], ephemeral: true });
    return;
  }

  const modal = new ModalBuilder()
    .setCustomId('modal:create-user')
    .setTitle('Create Pterodactyl User');

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(
      new TextInputBuilder().setCustomId('username').setLabel('Username').setStyle(TextInputStyle.Short).setRequired(true).setMinLength(3).setMaxLength(32),
    ),
    new ActionRowBuilder<TextInputBuilder>().addComponents(
      new TextInputBuilder().setCustomId('email').setLabel('Email').setStyle(TextInputStyle.Short).setRequired(true),
    ),
    new ActionRowBuilder<TextInputBuilder>().addComponents(
      new TextInputBuilder().setCustomId('first_name').setLabel('First Name').setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(64),
    ),
    new ActionRowBuilder<TextInputBuilder>().addComponents(
      new TextInputBuilder().setCustomId('last_name').setLabel('Last Name').setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(64),
    ),
    new ActionRowBuilder<TextInputBuilder>().addComponents(
      new TextInputBuilder().setCustomId('password').setLabel('Password (min 8 chars)').setStyle(TextInputStyle.Short).setRequired(true).setMinLength(8),
    ),
  );

  await interaction.showModal(modal);
});
