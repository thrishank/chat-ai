import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { body } = await req.json();
    const sessionId = body.sessionId;
    if (!sessionId) return Response.json("SessionId not provided")

    const messagesWithFeedback = await prisma.message.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
      include: {
        Feedback: true // Include related feedback
      }
    });

    const formattedResponse = messagesWithFeedback.map(message => ({
      id: message.id,
      message_content: message.message_content,
      isAi: message.isAi,
      feedback: message.Feedback ? {
        id: message.Feedback.id,
        isLiked: message.Feedback.isLiked
      } : null
    }));

    return Response.json(formattedResponse);
  } catch (err) {
    console.log(err);
    return Response.json(err, { status: 400 });
  }
}

export async function GET() {
  try {
    const session = await prisma.session.findMany();
    session.reverse();
    return Response.json(session);
  } catch (err) {
    console.log(err);
    return Response.json(err, { status: 400 });
  }
}
