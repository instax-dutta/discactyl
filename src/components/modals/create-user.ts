import { ModalSubmitInteraction } from 'discord.js';
import { applicationClient } from '../../lib/pterodactyl/application';
import { registerComponentHandler } from '../../events/interactionCreate';
import { addAuditLog } from '../../lib/db/audit-log';
import { successEmbed, errorEmbed } from '../../lib/embeds';

registerComponentHandler('modal:create-user', async (interaction: ModalSubmitInteraction) => {
  await interaction.deferReply({ ephemeral: true });

  const username = interaction.fields.getTextInputValue('username');
  const email = interaction.fields.getTextInputValue('email');
  const firstName = interaction.fields.getTextInputValue('first_name');
  const lastName = interaction.fields.getTextInputValue('last_name');
  const password = interaction.fields.getTextInputValue('password');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    await interaction.editReply({ embeds: [errorEmbed('Invalid Email', 'Please provide a valid email address.')] });
    return;
  }

  try {
    const user = await applicationClient.createUser({
      email,
      username,
      first_name: firstName,
      last_name: lastName,
      password,
    });

    addAuditLog(interaction.guildId, interaction.user.id, 'user.create', 'success', `${user.id}`, user.username);
    await interaction.editReply({
      embeds: [successEmbed(
        'User Created',
        `**${user.username}** (ID: ${user.id}) created.\nEmail: ${user.email}`,
      )],
    });
  } catch (err: any) {
    const detail = err?.response?.data?.errors?.[0]?.detail || err.message;
    addAuditLog(interaction.guildId, interaction.user.id, 'user.create', 'failure', undefined, undefined, detail);
    await interaction.editReply({ embeds: [errorEmbed('Creation Failed', detail)] });
  }
});
