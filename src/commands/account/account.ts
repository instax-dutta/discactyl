import { requireRole } from '../../lib/permissions';
import { clientApi } from '../../lib/pterodactyl/client';
import { encrypt } from '../../lib/encrypt';
import { upsertUserLink, getUserLink, deleteUserLink } from '../../lib/db/user-links';
import { successEmbed, infoEmbed, errorEmbed } from '../../lib/embeds';
import { registerAccountSubcommand } from './index';
import { addAuditLog } from '../../lib/db/audit-log';

registerAccountSubcommand('link', async (interaction) => {
  await interaction.deferReply({ ephemeral: true });

  const apiKey = interaction.options.getString('api_key', true);
  const existing = getUserLink(interaction.user.id);

  try {
    const account = await clientApi.validateApiKey(apiKey);
    const encrypted = encrypt(apiKey);
    upsertUserLink(interaction.user.id, account.id, encrypted.encrypted, encrypted.iv, encrypted.authTag);

    addAuditLog(interaction.guildId, interaction.user.id, 'account.link', 'success', `${account.id}`, account.username);
    await interaction.editReply({
      embeds: [successEmbed(
        'Account Linked',
        existing
          ? `Updated: Pterodactyl account **${account.username}** (ID: ${account.id}) linked to your Discord.`
          : `Pterodactyl account **${account.username}** (ID: ${account.id}) linked to your Discord.`,
      )],
    });
  } catch (err: any) {
    const detail = err?.response?.data?.errors?.[0]?.detail || err.message;
    addAuditLog(interaction.guildId, interaction.user.id, 'account.link', 'failure', undefined, undefined, detail);
    await interaction.editReply({ embeds: [errorEmbed('Link Failed', detail)] });
  }
});

registerAccountSubcommand('unlink', async (interaction) => {
  await interaction.deferReply({ ephemeral: true });

  const existing = getUserLink(interaction.user.id);
  if (!existing) {
    await interaction.editReply({ embeds: [infoEmbed('Not Linked', 'No Pterodactyl account is linked to your Discord.')] });
    return;
  }

  deleteUserLink(interaction.user.id);
  await interaction.editReply({ embeds: [successEmbed('Account Unlinked', 'Your Pterodactyl account has been unlinked.')] });
});

registerAccountSubcommand('view', async (interaction) => {
  await interaction.deferReply({ ephemeral: true });

  const existing = getUserLink(interaction.user.id);
  if (!existing) {
    await interaction.editReply({
      embeds: [infoEmbed('Not Linked', 'No account linked. Use `/account link` to connect your Pterodactyl account.')],
    });
    return;
  }

  try {
    const account = await clientApi.getAccount(interaction.user.id);
    await interaction.editReply({
      embeds: [infoEmbed(
        'Linked Account',
        `**Username:** ${account.username}\n**Email:** ${account.email}\n**Pterodactyl ID:** ${account.id}\n**Admin:** ${account.admin ? 'Yes' : 'No'}`,
      )],
    });
  } catch {
    await interaction.editReply({
      embeds: [infoEmbed(
        'Linked Account',
        `**Pterodactyl ID:** ${existing.pterodactyl_user_id}\n_(Could not fetch account details — API key may be invalid.)_`,
      )],
    });
  }
});
