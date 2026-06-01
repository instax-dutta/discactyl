import { clientApi } from '../../lib/pterodactyl/client';
import { requireRole, checkServerPermission } from '../../lib/permissions';
import { infoEmbed, successEmbed, errorEmbed } from '../../lib/embeds';
import { addAuditLog } from '../../lib/db/audit-log';
import { registerServerSubcommand } from './index';

registerServerSubcommand('console', async (interaction) => {
  await interaction.deferReply({ ephemeral: true });

  const identifier = interaction.options.getString('server', true);
  const command = interaction.options.getString('command');
  const lines = interaction.options.getInteger('lines');

  const { allowed } = requireRole('operator')(interaction.member as any);
  if (!allowed) {
    await interaction.editReply({ embeds: [infoEmbed('Permission Denied', 'You do not have permission.')] });
    return;
  }

  if (!checkServerPermission(interaction.member as any, identifier, 'operate')) {
    await interaction.editReply({ embeds: [infoEmbed('Access Denied', 'No access to this server.')] });
    return;
  }

  if (command) {
    try {
      const sanitized = command.replace(/[<>"'`$|&;()]/g, '').trim();
      if (!sanitized) {
        await interaction.editReply({ embeds: [errorEmbed('Invalid Command', 'Command cannot be empty after sanitization.')] });
        return;
      }
      await clientApi.sendConsoleCommand(interaction.user.id, identifier, sanitized);
      await interaction.editReply({ embeds: [successEmbed('Command Sent', `\`${sanitized}\` sent to \`${identifier}\``)] });
    } catch (err: any) {
      await interaction.editReply({ embeds: [errorEmbed('Command Failed', err?.response?.data?.errors?.[0]?.detail || err.message)] });
    }
    return;
  }

  if (lines) {
    await interaction.editReply({
      embeds: [infoEmbed('Console Logs', 'Live console logs require WebSocket streaming — coming in v2. Use `/server console send` to execute commands.')],
    });
    return;
  }

  await interaction.editReply({ embeds: [infoEmbed('Usage', 'Use `/server console send <server> <command>` to send commands, or `/server console logs <server> <lines>` to view logs (v2).')] });
});
