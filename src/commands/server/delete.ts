import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ChatInputCommandInteraction } from 'discord.js';
import { requireRole } from '../../lib/permissions';
import { infoEmbed } from '../../lib/embeds';
import { registerServerSubcommand } from './index';

registerServerSubcommand('delete', async (interaction: ChatInputCommandInteraction) => {
  const identifier = interaction.options.getString('server', true);
  const { allowed, role } = requireRole('admin')(interaction.member as any);
  if (!allowed || role !== 'admin') {
    await interaction.reply({ embeds: [infoEmbed('Permission Denied', 'Only admins can delete servers.')], ephemeral: true });
    return;
  }

  const modal = new ModalBuilder()
    .setCustomId(`modal:confirm-delete-server:${identifier}`)
    .setTitle('Confirm Server Deletion');

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(
      new TextInputBuilder()
        .setCustomId('confirmation')
        .setLabel('Type the server UUID to confirm')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setPlaceholder(identifier),
    ),
  );

  await interaction.showModal(modal);
});
