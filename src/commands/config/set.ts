import { upsertGuildConfig } from '../../lib/db/guild-config';
import { cache } from '../../lib/cache';
import { infoEmbed, successEmbed, errorEmbed } from '../../lib/embeds';
import { registerConfigSubcommand } from './index';
import { env } from '../../config/env';

function setRoleHandler(roleField: 'admin_role_id' | 'operator_role_id' | 'viewer_role_id') {
  return async (interaction: any) => {
    await interaction.deferReply({ ephemeral: true });

    if (!interaction.memberPermissions?.has('ManageGuild')) {
      await interaction.editReply({ embeds: [infoEmbed('Permission Denied', 'You need the `Manage Server` permission.')] });
      return;
    }

    const role = interaction.options.getRole('role', true);
    upsertGuildConfig(interaction.guildId, { [roleField]: role.id });
    cache.del(`guild:${interaction.guildId}:config`);

    await interaction.editReply({
      embeds: [successEmbed('Configuration Updated', `${roleField.replace('_role_id', '').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} role set to ${role}.`)],
    });
  };
}

registerConfigSubcommand('set-admin-role', setRoleHandler('admin_role_id'));
registerConfigSubcommand('set-operator-role', setRoleHandler('operator_role_id'));
registerConfigSubcommand('set-viewer-role', setRoleHandler('viewer_role_id'));
