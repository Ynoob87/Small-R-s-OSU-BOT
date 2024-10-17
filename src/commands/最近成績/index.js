// 導入依賴項
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import axios from "axios";
import dotenv from "dotenv";
// 一些函式庫
import { getOsuToken } from "@/utils/getOsuToken";
import { convertToPercentage } from "@/utils/convertToPercentage";
import { getMaxCombo } from "@/utils/calculateMaxCombo";

dotenv.config();

export const command = new SlashCommandBuilder()
  .setName("最近成績")
  .setDescription("查詢最近的所有成績")
  .addStringOption((option) =>
    option.setName("用戶名").setDescription("要查詢的用戶名").setRequired(true)
  );

export const action = async (interaction) => {
  const username = interaction.options.getString("用戶名");
  try {
    const accessToken = await getOsuToken();
    console.log(`查詢用戶名: ${username}`);

    const userResponse = await axios.get(
      `https://osu.ppy.sh/api/v2/users/${username}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const userId = userResponse.data.id;
    console.log(`User ID: ${userId}`);

    // 使用新的API端點獲取最近的所有成績
    const response = await axios.get(
      `https://osu.ppy.sh/api/v2/users/${userId}/scores/recent`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          limit: 1,
        },
      }
    );

    const recentScore = response.data[0];
    if (recentScore) {
      const MaxCombo = await getMaxCombo(recentScore.beatmap.id);
      console.log(recentScore);

      const exampleEmbed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setAuthor({
          name: `${username}: ${userResponse.data.statistics.pp}pp (#${userResponse.data.statistics.global_rank} ${userResponse.data.country.code}#${userResponse.data.statistics.country_rank})`,
          iconURL: `https://flagcdn.com/256x192/${userResponse.data.country.code.toLowerCase()}.png`,
        })
        .setTitle(
          `${recentScore.beatmapset.title} [${recentScore.beatmap.version}] [${recentScore.beatmap.difficulty_rating}★]`
        )
        .setURL(recentScore.beatmap.url)
        .setImage(`${recentScore.beatmapset.covers.cover}`)
        .addFields(
          {
            name: "獲得的PP",
            value: `${
              recentScore.pp == null ? 0 : recentScore.pp.toFixed(2)
            }PP`,
            inline: true,
          },
          {
            name: "地圖評分",
            value: `評分: ${recentScore.rank}, 總分: ${recentScore.score}`,
            inline: true,
          },
          {
            name: "準確率",
            value: `${convertToPercentage(recentScore.accuracy)}`,
            inline: true,
          },
          {
            name: "所使用的Mods",
            value: `${
              recentScore.mods.length ? recentScore.mods.join(", ") : "NM"
            }`,
            inline: true,
          },
          {
            name: "總連擊數",
            value: `x${recentScore.max_combo}/${MaxCombo}`,
            inline: true,
          },
          {
            name: "統計數據",
            value: `[${recentScore.statistics.count_300}/${recentScore.statistics.count_100}/${recentScore.statistics.count_50}/${recentScore.statistics.count_miss}]`,
            inline: true,
          }
        )
        .setFooter({
          text: "Made By Small R <3",
          iconURL:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Osu%21_Logo_2016.svg/2048px-Osu%21_Logo_2016.svg.png", // 這裡提供一個有效的URL
        });

      await interaction.reply({ embeds: [exampleEmbed] });
    } else {
      await interaction.reply("未找到最近成績。");
    }
    console.log("Successfully replied to interaction");
  } catch (error) {
    if (error.response) {
      console.error("查詢成績時出錯: ", error.response.data);
    } else {
      console.error("查詢成績時出錯: ", error.message);
    }
    await interaction.reply("查詢成績時出錯，請稍後再試。");
  }
};
