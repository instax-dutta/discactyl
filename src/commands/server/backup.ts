import { EmbedBuilder } from 'discord.js';
import { clientApi } from '../../lib/pterodactyl/client';
import { requireRole, checkServerPermission } from '../../lib/permissions';
import { infoEmbed, successEmbed, errorEmbed, formatBytes } from '../../lib/embeds';
import { addAuditLog } from '../../lib/db/audit-log';
import { registerServerSubcommand } from './index';

registerServerSubcommand('backup', async (interaction) => {
  await interaction.deferReply({ ephemeral: true });

  const identifier = interaction.options.getString('server', true);
  const action = interaction.options.getString('action', true);

  const { allowed } = requireRole('operator')(interaction.member as any);
  if (!allowed) {
    await interaction.editReply({ embeds: [infoEmbed('Permission Denied', 'You do not have permission.')] });
    return;
  }

  if (!checkServerPermission(interaction.member as any, identifier, 'operate')) {
    await interaction.editReply({ embeds: [infoEmbed('Access Denied', 'No access to this server.')] });
    return;
  }

  try {
    if (action === 'list') {
      const backups = await clientApi.listBackups(interaction.user.id, identifier);
      if (backups.length === 0) {
        await interaction.editReply({ embeds: [infoEmbed('No Backups', 'No backups found for this server.')] });
        return;
      }

      const embeds = backups.slice(0, 10).map(b => new EmbedBuilder()
        .setColor(b.is_successful ? 0x22c55e : 0xfacc15)
        .setTitle(b.name || `Backup ${b.uuid.slice(0, 8)}`)
        .addFields(
          { name: 'Size', value: formatBytes(b.bytes), inline: true },
          { name: 'Status', value: b.is_successful ? '✅ Complete' : b.is_locked ? '🔒 Locked' : '⏳ Pending', inline: true },
          { name: 'Created', value: b.created_at ? new Date(b.created_at).toLocaleString() : 'Unknown', inline: true },
        ));

      await interaction.editReply({ embeds });
    } else if (action === 'create') {
      const name = interaction.options.getString('name') || undefined;
      const backup = await clientApi.createBackup(interaction.user.id, identifier, name);
      addAuditLog(interaction.guildId, interaction.user.id, 'backup.create', 'success', identifier);
      await interaction.editReply({ embeds: [successEmbed('Backup Created', `Backup \`${backup.uuid.slice(0, 8)}…\` initiated.`)] });
    }
  } catch (err: any) {
    await interaction.editReply({ embeds: [errorEmbed('Backup Failed', err?.response?.data?.errors?.[0]?.detail || err.message)] });
  }
});
