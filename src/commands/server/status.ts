import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { applicationClient } from '../../lib/pterodactyl/application';
import { clientApi } from '../../lib/pterodactyl/client';
import { requireRole, checkServerPermission } from '../../lib/permissions';
import { infoEmbed, statusColor, formatBytes, formatUptime, errorEmbed } from '../../lib/embeds';
import { registerServerSubcommand } from './index';

registerServerSubcommand('status', async (interaction) => {
  await interaction.deferReply({ ephemeral: true });

  const identifier = interaction.options.getString('server', true);
  const { allowed } = requireRole('viewer')(interaction.member as any);
  if (!allowed) {
    await interaction.editReply({ embeds: [infoEmbed('Permission Denied', 'You do not have permission.')] });
    return;
  }

  if (!checkServerPermission(interaction.member as any, identifier, 'view')) {
    await interaction.editReply({ embeds: [infoEmbed('Access Denied', 'You do not have access to this server.')] });
    return;
  }

  try {
    const resources = await clientApi.getServerResources(interaction.user.id, identifier);
    const state = resources.current_state;
    const r = resources.resources;

    const embed = new EmbedBuilder()
      .setColor(statusColor(state))
      .setTitle('Server Status')
      .addFields(
        { name: 'Identifier', value: `\`${identifier}\``, inline: false },
        { name: 'Status', value: state, inline: true },
        { name: 'CPU', value: state === 'offline' ? '—' : `${r.cpu_absolute.toFixed(1)}%`, inline: true },
        { name: 'Memory', value: state === 'offline' ? '—' : `${formatBytes(r.memory_bytes)}`, inline: true },
        { name: 'Disk', value: state === 'offline' ? '—' : `${formatBytes(r.disk_bytes)}`, inline: true },
        { name: 'Uptime', value: state === 'offline' ? '—' : formatUptime(r.uptime), inline: true },
      )
      .setTimestamp();

    const role = requireRole('operator')(interaction.member as any).role;
    const canOperate = role === 'admin' || role === 'operator';

    const powerRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(`button:power:start:${identifier}`).setLabel('▶ Start').setStyle(ButtonStyle.Success).setDisabled(!canOperate || state === 'running'),
      new ButtonBuilder().setCustomId(`button:power:stop:${identifier}`).setLabel('⏹ Stop').setStyle(ButtonStyle.Danger).setDisabled(!canOperate || state === 'offline'),
      new ButtonBuilder().setCustomId(`button:power:restart:${identifier}`).setLabel('🔄 Restart').setStyle(ButtonStyle.Primary).setDisabled(!canOperate || state === 'offline'),
      new ButtonBuilder().setCustomId(`button:power:kill:${identifier}`).setLabel('💀 Kill').setStyle(ButtonStyle.Danger).setDisabled(role !== 'admin'),
    );

    await interaction.editReply({ embeds: [embed], components: [powerRow] });
  } catch (err: any) {
    await interaction.editReply({ embeds: [errorEmbed('Error', `Failed to get server status: ${err?.response?.data?.errors?.[0]?.detail || err.message}`)] });
  }
});
