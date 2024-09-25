import { useState } from "react";
import axiosInstance from "@/restApi/axiosInstance";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await axiosInstance.post("/api/chat", {
      prompt,
    });

    console.log(res, "res");
    const data = await res.json();
    setResponse(data.answer);
  };

  return (
    <div>
      <h1>AI 对话</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={5}
          cols={40}
          placeholder="输入你的问题..."
        />
        <br />
        <button type="submit">发送</button>
      </form>
      {response && (
        <div>
          <h2>AI 回答:</h2>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}
