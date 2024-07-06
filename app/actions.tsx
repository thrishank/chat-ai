"use server";

import { createStreamableValue } from "ai/rsc";
import { CoreMessage, streamText } from "ai";
import { google } from "@ai-sdk/google";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function continueConversation(
  messages: CoreMessage[],
  sessionId: string
) {
  const msg = await prisma.message.create({
    // Storing the client Prompt to the database
    data: {
      message_content: JSON.stringify(messages[0].content),
      sessionId,
    },
  });

  const result = await streamText({
    model: google("models/gemini-1.5-flash-latest"), // calling the google gemini API
    messages,
    async onFinish({ text }) {
      await prisma.message.create({
        // storing the AI response to the DB
        data: {
          message_content: text,
          isAi: true,
          sessionId,
        },
      });
    },
  });

  const stream = createStreamableValue(result.textStream);
  return { message: stream.value, id: msg.id };
}
