import { Client, Events, GatewayIntentBits } from "discord.js";
import vuelnit from "@/core/vue";
import dotenv from "dotenv";
import { loadCommands } from "@/core/loader";

// 配置 dotenv
dotenv.config();

// 初始化 Discord 客戶端
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// 載入命令
(async () => {
  try {
    await loadCommands();
    console.log("Commands loaded successfully");
  } catch (error) {
    console.error("Error loading commands:", error);
  }
})();

// 初始化其他功能
vuelnit();

// 當客戶端準備就緒時執行的操作
client.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

// 處理互動事件
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;
  console.log(`Received command: ${commandName}`);

  // 動態加載命令文件並執行命令操作
  try {
    const commandFile = await import(`./commands/${commandName}/index.js`);
    await commandFile.action(interaction);
    console.log(`Successfully executed command: ${commandName}`);
  } catch (error) {
    console.error(`Error executing command ${commandName}:`, error);
    await interaction.reply("執行命令時出錯，請稍後再試。");
  }
});

// 登錄客戶端
client.login(process.env.DISCORD_TOKEN);
