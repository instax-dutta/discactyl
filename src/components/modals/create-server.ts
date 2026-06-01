import { ModalSubmitInteraction } from 'discord.js';
import { applicationClient } from '../../lib/pterodactyl/application';
import { registerComponentHandler } from '../../events/interactionCreate';
import { addAuditLog } from '../../lib/db/audit-log';
import { successEmbed, errorEmbed } from '../../lib/embeds';

registerComponentHandler('modal:create-server', async (interaction: ModalSubmitInteraction) => {
  await interaction.deferReply({ ephemeral: true });

  const name = interaction.fields.getTextInputValue('name');
  const userId = parseInt(interaction.fields.getTextInputValue('user_id'), 10);
  const memory = parseInt(interaction.fields.getTextInputValue('memory'), 10);
  const disk = parseInt(interaction.fields.getTextInputValue('disk'), 10);
  const cpu = parseInt(interaction.fields.getTextInputValue('cpu'), 10);

  if (isNaN(userId) || isNaN(memory) || isNaN(disk) || isNaN(cpu)) {
    await interaction.editReply({ embeds: [errorEmbed('Invalid Input', 'All numeric fields must be valid numbers.')] });
    return;
  }

  try {
    const { allocations } = await applicationClient.listAllocations(1, 1);
    if (allocations.length === 0) {
      await interaction.editReply({ embeds: [errorEmbed('No Allocations', 'No free allocations found on node 1.')] });
      return;
    }

    const freeAlloc = allocations.find(a => !a.assigned);
    if (!freeAlloc) {
      await interaction.editReply({ embeds: [errorEmbed('No Allocations', 'No free allocations available.')] });
      return;
    }

    const server = await applicationClient.createServer({
      name,
      user: userId,
      egg: 1,
      docker_image: 'ghcr.io/pterodactyl/yolks:alpine',
      startup: './start.sh',
      environment: {},
      limits: { memory, swap: 0, disk, io: 500, cpu },
      feature_limits: { databases: 0, allocations: 0, backups: 2 },
      allocation: { default: freeAlloc.id },
    });

    addAuditLog(interaction.guildId, interaction.user.id, 'server.create', 'success', server.uuid, server.name);
    await interaction.editReply({
      embeds: [successEmbed(
        'Server Created',
        `**${server.name}** (UUID: \`${server.uuid}\`) has been created.`,
      )],
    });
  } catch (err: any) {
    const detail = err?.response?.data?.errors?.[0]?.detail || err.message;
    addAuditLog(interaction.guildId, interaction.user.id, 'server.create', 'failure', undefined, undefined, detail);
    await interaction.editReply({ embeds: [errorEmbed('Creation Failed', detail)] });
  }
});
