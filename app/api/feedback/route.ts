import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { body } = await req.json();
  const messageId = body.messageId;
  const isLiked = body.isLiked;
  try {
    const feedback = await prisma.feedback.upsert({
      where: { messageId: parseInt(messageId) },
      update: { isLiked },
      create: { messageId: parseInt(messageId), isLiked },
    });

    return NextResponse.json(feedback, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error submitting feedback" },
      { status: 400 }
    );
  }
}
