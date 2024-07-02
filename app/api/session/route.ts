import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const sessionId = await prisma.session.create({
    data: {},
  });
  return Response.json(sessionId);
}
