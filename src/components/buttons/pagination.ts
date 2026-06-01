import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ButtonInteraction, EmbedBuilder } from 'discord.js';
import { applicationClient } from '../../lib/pterodactyl/application';
import { registerComponentHandler } from '../../events/interactionCreate';
import { infoEmbed, errorEmbed } from '../../lib/embeds';
import { logger } from '../../lib/logger';

registerComponentHandler('pagination:prev:server', async (interaction: ButtonInteraction) => {
  await handlePagination(interaction, -1);
});

registerComponentHandler('pagination:next:server', async (interaction: ButtonInteraction) => {
  await handlePagination(interaction, 1);
});

async function handlePagination(interaction: ButtonInteraction, direction: number) {
  const embed = interaction.message.embeds[0];
  let currentPage = 1;

  await interaction.deferReply({ ephemeral: false });

  try {
    const { servers, meta } = await applicationClient.listServers(currentPage + direction);
    const embeds = servers.slice(0, 10).map(s => new EmbedBuilder()
      .setColor(s.status === 'running' ? 0x22c55e : 0xef4444)
      .setTitle(s.name)
      .addFields(
        { name: 'UUID', value: `\`${s.uuid}\``, inline: true },
        { name: 'Status', value: s.status || 'running', inline: true },
        { name: 'Memory', value: `${s.limits.memory} MB`, inline: true },
        { name: 'Disk', value: `${s.limits.disk} MB`, inline: true },
      ));

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId('pagination:prev:server').setLabel('◀').setStyle(ButtonStyle.Secondary).setDisabled(currentPage + direction <= 1),
      new ButtonBuilder().setCustomId('pagination:next:server').setLabel('▶').setStyle(ButtonStyle.Secondary).setDisabled(currentPage + direction >= meta.pagination.total_pages),
    );

    await interaction.editReply({ embeds, components: [row] });
  } catch (err) {
    logger.error({ err }, 'Pagination error');
    await interaction.editReply({ embeds: [errorEmbed('Error', 'Failed to load page.')] });
  }
}
