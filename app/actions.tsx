"use server";

import { createStreamableValue } from "ai/rsc";
import { CoreMessage, streamText } from "ai";
import { google } from "@ai-sdk/google";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function continueConversation(
  messages: CoreMessage[],
  sessionId: string,
  order: number
) {
  const result = await streamText({
    model: google("models/gemini-1.5-flash-latest"),
    messages,
    onFinish({ text }) {
      prisma.message.create({
        data: {
          content: text,
          isAi: true,
          sessionId,
          order,
        },
      });
    },
  });

  const stream = createStreamableValue(result.textStream);
  return { message: stream.value };
}
