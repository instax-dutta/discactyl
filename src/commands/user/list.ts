import { EmbedBuilder } from 'discord.js';
import { applicationClient } from '../../lib/pterodactyl/application';
import { requireRole } from '../../lib/permissions';
import { infoEmbed, errorEmbed } from '../../lib/embeds';
import { registerUserSubcommand } from './index';

registerUserSubcommand('list', async (interaction) => {
  await interaction.deferReply({ ephemeral: true });

  const { allowed } = requireRole('admin')(interaction.member as any);
  if (!allowed) {
    await interaction.editReply({ embeds: [infoEmbed('Permission Denied', 'Only admins can list users.')] });
    return;
  }

  try {
    const { users } = await applicationClient.listUsers(1);
    if (users.length === 0) {
      await interaction.editReply({ embeds: [infoEmbed('No Users', 'No Pterodactyl users found.')] });
      return;
    }

    const embeds = users.slice(0, 10).map(u => new EmbedBuilder()
      .setColor(0x3b82f6)
      .setTitle(`${u.username}${u.root_admin ? ' ⚙️' : ''}`)
      .addFields(
        { name: 'ID', value: `${u.id}`, inline: true },
        { name: 'Email', value: u.email, inline: true },
        { name: '2FA', value: u['2fa'] ? '✅' : '❌', inline: true },
      ));

    await interaction.editReply({ embeds });
  } catch (err: any) {
    await interaction.editReply({ embeds: [errorEmbed('Error', `Failed to fetch users: ${err.message}`)] });
  }
});
