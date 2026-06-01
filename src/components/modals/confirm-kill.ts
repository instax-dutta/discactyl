import { ButtonInteraction } from 'discord.js';
import { clientApi } from '../../lib/pterodactyl/client';
import { requireRole } from '../../lib/permissions';
import { registerComponentHandler } from '../../events/interactionCreate';
import { addAuditLog } from '../../lib/db/audit-log';
import { successEmbed, errorEmbed, statusColor } from '../../lib/embeds';
import { EmbedBuilder } from 'discord.js';

registerComponentHandler('button:power:kill:', async (interaction: ButtonInteraction) => {
  await interaction.deferReply({ ephemeral: true });

  const identifier = interaction.customId.split(':')[3];
  if (!identifier) {
    await interaction.editReply({ embeds: [errorEmbed('Invalid Action', 'Malformed button data.')] });
    return;
  }

  const { allowed, role } = requireRole('admin')(interaction.member as any);
  if (!allowed || role !== 'admin') {
    await interaction.editReply({ embeds: [errorEmbed('Permission Denied', 'Only admins can kill servers.')] });
    return;
  }

  try {
    await clientApi.sendPowerAction(interaction.user.id, identifier, 'kill');
    addAuditLog(interaction.guildId, interaction.user.id, 'server.kill', 'success', identifier);

    const resources = await clientApi.getServerResources(interaction.user.id, identifier);
    const embed = new EmbedBuilder()
      .setColor(statusColor(resources.current_state))
      .setTitle('Server Killed')
      .addFields({ name: 'Status', value: resources.current_state, inline: true })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch (err: any) {
    const detail = err?.response?.data?.errors?.[0]?.detail || err.message;
    addAuditLog(interaction.guildId, interaction.user.id, 'server.kill', 'failure', identifier, undefined, detail);
    await interaction.editReply({ embeds: [errorEmbed('Kill Failed', detail)] });
  }
});
