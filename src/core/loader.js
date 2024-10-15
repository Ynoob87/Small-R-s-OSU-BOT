import { Presence, REST, Routes } from "discord.js";
import FastGlob from "fast-glob";

const updateSlashCommands = async (commands) => {
  const rest = new REST({ version: 10 }).setToken(process.env.DISCORD_TOKEN);
  const result = await rest.put(
    Routes.applicationCommands(process.env.APPLICATION_ID),
    {
      body: commands,
    }
  );
  console.log(result);
};

export async function loadCommands() {
  const commands = [];
  const files = await FastGlob("./src/commands/**/*.js");

  for (const file of files) {
    const cmd = await import(file);
    commands.push(cmd.command);
  }
  updateSlashCommands(commands);
}

//手寫API
/*const updateSlashCommands = () => {
  axias({
    method: "PUT",
    url: "https://discord.com/api/v10/applications/<my_application_id>/commands",
    headers: {
      Authorization: "Bot {botToken}",
    },
    data: {
      body: [{ name: "播放", Descripition: "撥放音樂" }],
    },
  });
};*/
