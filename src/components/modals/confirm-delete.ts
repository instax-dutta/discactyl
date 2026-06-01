import { ModalSubmitInteraction } from 'discord.js';
import { applicationClient } from '../../lib/pterodactyl/application';
import { registerComponentHandler } from '../../events/interactionCreate';
import { addAuditLog } from '../../lib/db/audit-log';
import { successEmbed, errorEmbed } from '../../lib/embeds';

registerComponentHandler('modal:confirm-delete-server:', async (interaction: ModalSubmitInteraction) => {
  await interaction.deferReply({ ephemeral: true });

  const serverId = interaction.customId.split(':')[2];
  if (!serverId) {
    await interaction.editReply({ embeds: [errorEmbed('Invalid Action', 'Malformed modal data.')] });
    return;
  }

  const confirmation = interaction.fields.getTextInputValue('confirmation');

  if (confirmation !== serverId) {
    await interaction.editReply({ embeds: [errorEmbed('Confirmation Mismatch', `Type \`${serverId}\` exactly to confirm deletion.`)] });
    return;
  }

  try {
    await applicationClient.deleteServer(parseInt(serverId, 10));
    addAuditLog(interaction.guildId, interaction.user.id, 'server.delete', 'success', serverId);
    await interaction.editReply({ embeds: [successEmbed('Server Deleted', `Server ID ${serverId} has been deleted.`)] });
  } catch (err: any) {
    const detail = err?.response?.data?.errors?.[0]?.detail || err.message;
    addAuditLog(interaction.guildId, interaction.user.id, 'server.delete', 'failure', serverId, undefined, detail);
    await interaction.editReply({ embeds: [errorEmbed('Delete Failed', detail)] });
  }
});
