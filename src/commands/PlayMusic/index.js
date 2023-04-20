import { SlashCommandBuilder } from "discord.js";

export const command = new SlashCommandBuilder()
  .setName("播放")
  .setDescription("撥放音樂");

const action = async (ctx) => {
  ctx.reply("hello");
};
