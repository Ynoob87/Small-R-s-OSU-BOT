// 導入依賴項
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import axios from "axios";
import dotenv from "dotenv";
// 有用的函式庫
import { getOsuToken } from "../../utils/getOsuToken";
import { convertToPercentage } from "../../utils/convertToPercentage";
import { getMaxCombo } from "../../utils/calculateMaxCombo";

dotenv.config();

export const command = new SlashCommandBuilder()
  .setName("最近通過")
  .setDescription("查詢最近通過的地圖的成績")
  .addStringOption((option) =>
    option.setName("用戶名").setDescription("要查詢的用戶名").setRequired(true)
  );

export const action = async (interaction) => {
  const username = interaction.options.getString("用戶名");
  try {
    const accessToken = await getOsuToken();

    console.log(`查詢用戶名: ${username}`);
    //console.log(`使用的 OAuth Token: ${accessToken}`);

    const userResponse = await axios.get(
      `https://osu.ppy.sh/api/v2/users/${username}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    // console.log(`User API Response: ${JSON.stringify(userResponse.data)}`);

    const userId = userResponse.data.id;
    console.log(`User ID: ${userId}`);

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

    //console.log(`API 回應狀態碼: ${response.status}`);
    //console.log(`API 回應數據: ${JSON.stringify(response.data)}`);

    const recentScore = response.data[0];
    if (recentScore) {
      const MaxCombo = await getMaxCombo(recentScore.beatmap.id);

      console.log(recentScore.beatmap.id);
      console.log(recentScore);
      //console.log(userResponse);

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
          // Performance Information
          {
            name: "獲得的PP",
            value: `${recentScore.pp.toFixed(2)}PP`,
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

          // Mods and Combos
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

          // Hit Statistics Breakdown
          {
            name: "統計數據 (300/100/50/Miss)",
            value: `[${recentScore.statistics.count_300}/${recentScore.statistics.count_100}/${recentScore.statistics.count_50}/${recentScore.statistics.count_miss}]`,
            inline: true,
          }
        );

      //.setTimestamp(recentScore.date)
      /*
        .addField("地圖評分", `${recentScore.rank}`, true)
        .addField("使用的Mods", `[${recentScore.mods.join(", ")}]`, true)
        .setTimestamp(recentScore.date)
        .setFooter(`用戶: ${username}`);*/

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
