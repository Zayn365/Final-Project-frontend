import axios from "axios";

const instance = axios.create({
  baseURL: "https://final-project-backend-m9nb.onrender.com/",
});

export default instance;
