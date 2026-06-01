import { requireRole } from '../../lib/permissions';
import { applicationClient } from '../../lib/pterodactyl/application';
import { infoEmbed, errorEmbed, successEmbed } from '../../lib/embeds';
import { addAuditLog } from '../../lib/db/audit-log';
import { registerUserSubcommand } from './index';

registerUserSubcommand('delete', async (interaction) => {
  await interaction.deferReply({ ephemeral: true });

  const userInput = interaction.options.getString('user', true);
  const { allowed, role } = requireRole('admin')(interaction.member as any);
  if (!allowed || role !== 'admin') {
    await interaction.editReply({ embeds: [infoEmbed('Permission Denied', 'Only admins can delete users.')] });
    return;
  }

  try {
    const userId = parseInt(userInput, 10);
    if (isNaN(userId)) {
      await interaction.editReply({ embeds: [errorEmbed('Invalid Input', 'Please provide a numeric user ID.')] });
      return;
    }

    const user = await applicationClient.getUser(userId);
    await applicationClient.deleteUser(userId);
    addAuditLog(interaction.guildId, interaction.user.id, 'user.delete', 'success', `${userId}`, user.username);
    await interaction.editReply({ embeds: [successEmbed('User Deleted', `User **${user.username}** (ID: ${userId}) has been deleted.`)] });
  } catch (err: any) {
    const detail = err?.response?.data?.errors?.[0]?.detail || err.message;
    addAuditLog(interaction.guildId, interaction.user.id, 'user.delete', 'failure', userInput, undefined, detail);
    await interaction.editReply({ embeds: [errorEmbed('Delete Failed', detail)] });
  }
});
