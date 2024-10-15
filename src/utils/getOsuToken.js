import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const getOsuToken = async () => {
  try {
    const response = await axios.post("https://osu.ppy.sh/oauth/token", {
      client_id: process.env.OSU_CLIENT_ID,
      client_secret: process.env.OSU_CLIENT_SECRET,
      grant_type: "client_credentials",
      scope: "public",
    });
    console.log("Token Response:", response.data);
    return response.data.access_token;
  } catch (error) {
    console.error(
      "獲取OAuth Token時出錯: ",
      error.response ? error.response.data : error.message
    );
    throw new Error("無法獲取OAuth Token");
  }
};

export { getOsuToken };
