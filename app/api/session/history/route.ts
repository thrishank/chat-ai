import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { body } = await req.json();
    const sessionId = body.sessionId;
    const messages = await prisma.message.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" }, // Order by creation date in ascending order
    });
    return Response.json(messages);
  } catch (err) {
    console.log(err);
    return Response.json(err, { status: 400 });
  }
}
