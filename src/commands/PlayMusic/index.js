import { slashCommandBuilder } from "discord.js";

export const command = new slashCommandBuilder()
  .setName("播放")
  .setDescripition("撥放音樂");

const action = async (ctx) => {
  ctx.reply("hello")
};
