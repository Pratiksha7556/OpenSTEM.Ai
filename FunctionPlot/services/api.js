import axios from "axios";

const BASE = "/api";

export const analyzeProblem = (problem) =>
  axios.post(`${BASE}/analyze`, { problem }).then((r) => r.data);

export const analyzeImage = (file) => {
  const form = new FormData();
  form.append("file", file);
  return axios
    .post(`${BASE}/analyze-image`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);
};

export const getTopics = () => axios.get(`${BASE}/topics`).then((r) => r.data);
