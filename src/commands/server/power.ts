import { requireRole, checkServerPermission } from '../../lib/permissions';
import { clientApi } from '../../lib/pterodactyl/client';
import { addAuditLog } from '../../lib/db/audit-log';
import { successEmbed, errorEmbed, infoEmbed } from '../../lib/embeds';
import { registerServerSubcommand } from './index';

async function powerAction(interaction: any, signal: 'start' | 'stop' | 'restart' | 'kill') {
  await interaction.deferReply({ ephemeral: true });

  const identifier = interaction.options.getString('server', true);
  const { allowed } = requireRole('operator')(interaction.member as any);
  if (!allowed) {
    await interaction.editReply({ embeds: [infoEmbed('Permission Denied', 'You do not have permission.')] });
    return;
  }

  if (!checkServerPermission(interaction.member as any, identifier, 'operate')) {
    await interaction.editReply({ embeds: [infoEmbed('Access Denied', 'You do not have access to this server.')] });
    return;
  }

  try {
    await clientApi.sendPowerAction(interaction.user.id, identifier, signal);
    addAuditLog(interaction.guildId, interaction.user.id, `server.${signal}`, 'success', identifier);
    await interaction.editReply({ embeds: [successEmbed('Action Sent', `\`${signal}\` signal sent to server \`${identifier}\`.`)] });
  } catch (err: any) {
    const detail = err?.response?.data?.errors?.[0]?.detail || err.message;
    addAuditLog(interaction.guildId, interaction.user.id, `server.${signal}`, 'failure', identifier, undefined, detail);
    await interaction.editReply({ embeds: [errorEmbed('Action Failed', detail)] });
  }
}

registerServerSubcommand('start', (i) => powerAction(i, 'start'));
registerServerSubcommand('stop', (i) => powerAction(i, 'stop'));
registerServerSubcommand('restart', (i) => powerAction(i, 'restart'));
registerServerSubcommand('kill', (i) => powerAction(i, 'kill'));
