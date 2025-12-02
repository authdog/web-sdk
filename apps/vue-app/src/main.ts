import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import Home from "./views/Home.vue";
import Profile from "./views/Profile.vue";
import Login from "./views/Login.vue";
import "./style.css";

const routes = [
  { path: "/", component: Home },
  { path: "/profile", component: Profile },
  { path: "/login", component: Login },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const app = createApp(App);
app.use(router);
app.mount("#app");
