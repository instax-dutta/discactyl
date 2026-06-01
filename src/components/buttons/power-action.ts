import { EmbedBuilder, ButtonInteraction } from 'discord.js';
import { clientApi } from '../../lib/pterodactyl/client';
import { requireRole, checkServerPermission } from '../../lib/permissions';
import { registerComponentHandler } from '../../events/interactionCreate';
import { addAuditLog } from '../../lib/db/audit-log';
import { successEmbed, errorEmbed, statusColor, formatBytes, formatUptime } from '../../lib/embeds';

registerComponentHandler('button:power:', async (interaction: ButtonInteraction) => {
  await interaction.deferReply({ ephemeral: true });

  const parts = interaction.customId.split(':');
  const signal = parts[2];
  const identifier = parts[3];

  if (!signal || !identifier) {
    await interaction.editReply({ embeds: [errorEmbed('Invalid Action', 'Malformed button data.')] });
    return;
  }

  const { allowed, role } = requireRole('operator')(interaction.member as any);
  if (!allowed) {
    await interaction.editReply({ embeds: [errorEmbed('Permission Denied', 'You do not have permission.')] });
    return;
  }

  if (!checkServerPermission(interaction.member as any, identifier, 'operate')) {
    await interaction.editReply({ embeds: [errorEmbed('Access Denied', 'You do not have access to this server.')] });
    return;
  }

  if (signal === 'kill' && role !== 'admin') {
    await interaction.editReply({ embeds: [errorEmbed('Permission Denied', 'Only admins can kill servers.')] });
    return;
  }

  try {
    await clientApi.sendPowerAction(interaction.user.id, identifier, signal as any);
    addAuditLog(interaction.guildId, interaction.user.id, `server.${signal}`, 'success', identifier);

    const resources = await clientApi.getServerResources(interaction.user.id, identifier);
    const state = resources.current_state;
    const r = resources.resources;

    const statusEmbed = new EmbedBuilder()
      .setColor(statusColor(state))
      .setTitle('Server Status Updated')
      .addFields(
        { name: 'Status', value: state, inline: true },
        { name: 'CPU', value: `${r.cpu_absolute.toFixed(1)}%`, inline: true },
        { name: 'Memory', value: formatBytes(r.memory_bytes), inline: true },
        { name: 'Uptime', value: formatUptime(r.uptime), inline: true },
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [statusEmbed] });
  } catch (err: any) {
    const detail = err?.response?.data?.errors?.[0]?.detail || err.message;
    addAuditLog(interaction.guildId, interaction.user.id, `server.${signal}`, 'failure', identifier, undefined, detail);
    await interaction.editReply({ embeds: [errorEmbed('Action Failed', detail)] });
  }
});
