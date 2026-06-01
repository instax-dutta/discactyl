import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { applicationClient } from '../../lib/pterodactyl/application';
import { clientApi } from '../../lib/pterodactyl/client';
import { requireRole } from '../../lib/permissions';
import { infoEmbed, formatBytes } from '../../lib/embeds';
import { registerServerSubcommand } from './index';

registerServerSubcommand('list', async (interaction) => {
  await interaction.deferReply({ ephemeral: true });

  const { allowed } = requireRole('viewer')(interaction.member as any);
  if (!allowed) {
    await interaction.editReply({ embeds: [infoEmbed('Permission Denied', 'You do not have permission to list servers.')] });
    return;
  }

  try {
    const { servers, meta } = await applicationClient.listServers(1);
    if (servers.length === 0) {
      await interaction.editReply({ embeds: [infoEmbed('No Servers', 'No servers found on this panel.')] });
      return;
    }

    const embeds = servers.slice(0, 10).map(s => {
      const status = s.status || 'running';
      return new EmbedBuilder()
        .setColor(status === 'running' ? 0x22c55e : 0xef4444)
        .setTitle(s.name)
        .addFields(
          { name: 'UUID', value: `\`${s.uuid}\``, inline: true },
          { name: 'Node', value: `${s.node}`, inline: true },
          { name: 'Status', value: status, inline: true },
          { name: 'Memory', value: `${s.limits.memory} MB`, inline: true },
          { name: 'Disk', value: `${s.limits.disk} MB`, inline: true },
          { name: 'CPU', value: `${s.limits.cpu}%`, inline: true },
        );
    });

    await interaction.editReply({
      embeds,
      components: meta.pagination.total_pages > 1
        ? [new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder().setCustomId('pagination:prev:server').setLabel('◀').setStyle(ButtonStyle.Secondary).setDisabled(true),
          new ButtonBuilder().setCustomId('pagination:next:server').setLabel('▶').setStyle(ButtonStyle.Secondary).setDisabled(false),
        )]
        : [],
    });
  } catch (err: any) {
    await interaction.editReply({ embeds: [infoEmbed('Error', `Failed to fetch servers: ${err?.response?.data?.errors?.[0]?.detail || err.message}`)] });
  }
});
