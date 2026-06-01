import { requireRole } from '../../lib/permissions';
import { getGuildConfig } from '../../lib/db/guild-config';
import { cache } from '../../lib/cache';
import { infoEmbed, errorEmbed } from '../../lib/embeds';
import { registerConfigSubcommand } from './index';

registerConfigSubcommand('view', async (interaction) => {
  await interaction.deferReply({ ephemeral: true });

  if (!interaction.memberPermissions?.has('ManageGuild')) {
    await interaction.editReply({ embeds: [infoEmbed('Permission Denied', 'You need the `Manage Server` permission.')] });
    return;
  }

  const config = getGuildConfig(interaction.guildId!);
  if (!config) {
    await interaction.editReply({ embeds: [infoEmbed('No Config', 'No guild configuration found. Set roles using `/config set-*` commands.')] });
    return;
  }

  const fields = [
    `**Admin Role:** ${config.admin_role_id ? `<@&${config.admin_role_id}>` : 'Not set'}`,
    `**Operator Role:** ${config.operator_role_id ? `<@&${config.operator_role_id}>` : 'Not set'}`,
    `**Viewer Role:** ${config.viewer_role_id ? `<@&${config.viewer_role_id}>` : 'Not set'}`,
  ];

  await interaction.editReply({ embeds: [infoEmbed('Guild Configuration', fields.join('\n'))] });
});
