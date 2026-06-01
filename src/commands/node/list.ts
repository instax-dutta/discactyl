import { EmbedBuilder } from 'discord.js';
import { applicationClient } from '../../lib/pterodactyl/application';
import { requireRole } from '../../lib/permissions';
import { infoEmbed, errorEmbed } from '../../lib/embeds';
import { registerNodeSubcommand } from './index';

registerNodeSubcommand('list', async (interaction) => {
  await interaction.deferReply({ ephemeral: true });

  const { allowed } = requireRole('admin')(interaction.member as any);
  if (!allowed) {
    await interaction.editReply({ embeds: [infoEmbed('Permission Denied', 'Only admins can view nodes.')] });
    return;
  }

  try {
    const { nodes } = await applicationClient.listNodes(1);
    if (nodes.length === 0) {
      await interaction.editReply({ embeds: [infoEmbed('No Nodes', 'No nodes found.')] });
      return;
    }

    const embeds = nodes.slice(0, 10).map(n => new EmbedBuilder()
      .setColor(n.maintenance_mode ? 0xfacc15 : 0x22c55e)
      .setTitle(`${n.name}${n.maintenance_mode ? ' 🔧' : ''}`)
      .addFields(
        { name: 'ID', value: `${n.id}`, inline: true },
        { name: 'FQDN', value: n.fqdn, inline: true },
        { name: 'Memory', value: `${n.memory} MB`, inline: true },
        { name: 'Disk', value: `${n.disk} MB`, inline: true },
        { name: 'Location', value: `${n.location_id}`, inline: true },
        { name: 'Upload Size', value: `${n.upload_size} MB`, inline: true },
      ));

    await interaction.editReply({ embeds });
  } catch (err: any) {
    await interaction.editReply({ embeds: [errorEmbed('Error', `Failed to fetch nodes: ${err.message}`)] });
  }
});
