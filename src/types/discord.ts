import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder, ButtonInteraction, ModalSubmitInteraction, StringSelectMenuInteraction } from 'discord.js';

export interface Command {
  data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

export type ComponentHandler = (interaction: ButtonInteraction | ModalSubmitInteraction | StringSelectMenuInteraction) => Promise<void>;

export interface ComponentRegistry {
  [customId: string]: ComponentHandler;
}
