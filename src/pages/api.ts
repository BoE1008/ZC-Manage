import axios from "axios";

export default async function handler(req, res) {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4", // 使用你希望的模型
        messages: [{ role: "user", content: prompt }],
        max_tokens: 150,
      },
      {
        headers: {
          Authorization: `Bearer sk -
            y73Kf2vmhFivwodc5o0AkZ1xsCb4C2iLrOFsVvSk6jT3BlbkFJP55uza_IzVkiEA8cZRX4mEa_0I4_JLT2aaXIylqjoA`,
          "Content-Type": "application/json",
        },
      }
    );

    const answer = response.data.choices[0].message.content.trim();
    res.status(200).json({ answer });
  } catch (error) {
    res.status(500).json({ error: "Error fetching response from OpenAI" });
  }
}
