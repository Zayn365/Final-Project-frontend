import axios from "axios";

const instance = axios.create({
  baseURL: "https://final-project-backend-ashy-five.vercel.app/",
});

export default instance;
