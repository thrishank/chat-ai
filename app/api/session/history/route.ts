import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { sessionId } = await req.json();
  const data = await prisma.message.findUnique({
    where: {
        sessionId
    }
  })
}
