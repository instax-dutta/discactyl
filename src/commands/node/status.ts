import { EmbedBuilder } from 'discord.js';
import { applicationClient } from '../../lib/pterodactyl/application';
import { requireRole } from '../../lib/permissions';
import { infoEmbed, errorEmbed, formatBytes } from '../../lib/embeds';
import { registerNodeSubcommand } from './index';

registerNodeSubcommand('status', async (interaction) => {
  await interaction.deferReply({ ephemeral: true });

  const nodeId = interaction.options.getInteger('node_id', true);
  const { allowed } = requireRole('admin')(interaction.member as any);
  if (!allowed) {
    await interaction.editReply({ embeds: [infoEmbed('Permission Denied', 'Only admins can view nodes.')] });
    return;
  }

  try {
    const node = await applicationClient.getNode(nodeId);
    const embed = new EmbedBuilder()
      .setColor(node.maintenance_mode ? 0xfacc15 : 0x22c55e)
      .setTitle(`Node: ${node.name}`)
      .addFields(
        { name: 'ID', value: `${node.id}`, inline: true },
        { name: 'FQDN', value: `${node.scheme}://${node.fqdn}`, inline: true },
        { name: 'Maintenance', value: node.maintenance_mode ? '🔧 Yes' : '✅ No', inline: true },
        { name: 'Memory', value: `${node.memory} MB (overallocate: ${node.memory_overallocate}%)`, inline: false },
        { name: 'Disk', value: `${node.disk} MB (overallocate: ${node.disk_overallocate}%)`, inline: false },
        { name: 'Upload Size', value: `${node.upload_size} MB`, inline: true },
      );

    await interaction.editReply({ embeds: [embed] });
  } catch (err: any) {
    await interaction.editReply({ embeds: [errorEmbed('Error', `Failed to fetch node: ${err.message}`)] });
  }
});
