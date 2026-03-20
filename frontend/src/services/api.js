import axios from "axios";

const http = axios.create({ baseURL: "/api", timeout: 60000 });

http.interceptors.response.use(
  (res) => res,
  (err) =>
    Promise.reject(
      new Error(err?.response?.data?.detail || err?.message || "Network error"),
    ),
);

export const analyzeProblem = async (problem, subject = "physics") => {
  const { data } = await http.post("/analyze", { problem, subject });
  return data;
};

export const analyzeImage = async (file, subject = "physics") => {
  const form = new FormData();
  form.append("file", file);
  const { data } = await http.post(`/analyze-image?subject=${subject}`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const reSimulate = async (topic, variables) => {
  const prompts = {
    projectile_motion: `Simulate projectile motion with velocity=${variables.velocity} m/s, angle=${variables.angle} degrees`,
    pendulum: `Simulate pendulum with length=${variables.length}m, amplitude=${variables.amplitude} degrees`,
    wave: `Simulate wave with frequency=${variables.frequency}Hz, amplitude=${variables.amplitude}m, speed=${variables.velocity} m/s`,
    circuit: `Simulate circuit with voltage=${variables.voltage}V, resistance=${variables.resistance} ohms`,
    function_plot: `Plot the math function f(x) = ${variables.expression}`,
  };
  const { data } = await http.post("/analyze", {
    problem: prompts[topic] || `Simulate ${topic}`,
    subject: "physics",
  });
  return data;
};
