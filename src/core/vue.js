import { createApp } from "vue";
import { createPinia } from "pinia";

export default () => {
  console.log("vue is running");
  const vue = createApp({});
  const pinia = createPinia();

  vue.use(pinia);
};
