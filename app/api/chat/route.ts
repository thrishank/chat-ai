import { google } from "@ai-sdk/google";
import { StreamData, StreamingTextResponse, streamText } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: google("models/gemini-1.5-flash-latest"),
    messages,
  });

  const data = new StreamData();

  const stream = result.toAIStream({
    onFinal(_) {
      data.close();
    },
  });
  return new StreamingTextResponse(stream, {}, data);
}
