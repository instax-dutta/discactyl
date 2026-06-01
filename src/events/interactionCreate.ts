import { Events, Client, Interaction, ChatInputCommandInteraction, ButtonInteraction, ModalSubmitInteraction, StringSelectMenuInteraction } from 'discord.js';
import { logger } from '../lib/logger';
import { errorEmbed } from '../lib/embeds';

type AnyComponentInteraction = ButtonInteraction | ModalSubmitInteraction | StringSelectMenuInteraction;

const componentHandlers = new Map<string, (interaction: AnyComponentInteraction) => Promise<void>>();

export function registerComponentHandler(
  customIdPrefix: string,
  handler: (interaction: any) => Promise<void>,
): void {
  componentHandlers.set(customIdPrefix, handler);
}

export function getComponentHandler(customId: string): ((interaction: AnyComponentInteraction) => Promise<void>) | undefined {
  for (const [prefix, handler] of componentHandlers) {
    if (customId.startsWith(prefix)) return handler;
  }
  return undefined;
}

export function getGuildId(interaction: Interaction): string {
  return interaction.guildId || 'dm';
}

export default {
  name: Events.InteractionCreate,
  async execute(interaction: Interaction) {
    try {
      if (interaction.isChatInputCommand()) {
        await handleCommand(interaction);
      } else if (interaction.isButton() || interaction.isModalSubmit() || interaction.isStringSelectMenu()) {
        await handleComponent(interaction as AnyComponentInteraction);
      }
    } catch (err) {
      logger.error({ err, interactionId: interaction.id }, 'Interaction error');
      const reply = {
        embeds: [errorEmbed('Unexpected Error', 'An unexpected error occurred. Please try again.')],
        ephemeral: true,
      };
      if (interaction.isRepliable()) {
        if (interaction.deferred || interaction.replied) {
          await interaction.editReply(reply).catch(() => {});
        } else {
          await interaction.reply(reply).catch(() => {});
        }
      }
    }
  },
};

async function handleCommand(interaction: ChatInputCommandInteraction) {
  const command = (interaction.client as any).commands.get(interaction.commandName);
  if (!command) {
    await interaction.reply({ embeds: [errorEmbed('Unknown Command', 'This command is not registered.')], ephemeral: true });
    return;
  }
  await command.execute(interaction);
}

async function handleComponent(interaction: AnyComponentInteraction) {
  const customId = 'customId' in interaction ? interaction.customId : '';
  const handler = getComponentHandler(customId);
  if (!handler) {
    await interaction.reply({ embeds: [errorEmbed('Unknown Component', 'This interaction is no longer valid.')], ephemeral: true });
    return;
  }
  await handler(interaction);
}
