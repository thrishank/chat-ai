import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { string } from "zod";

const prisma = new PrismaClient();

export async function GET() {
  const cookieStore = cookies();
  const id = cookieStore.get("id");

  if (id) {
    const data = await prisma.session.findUnique({
      where: {
        id: id.value,
      },
    });
    return Response.json({ id: id, data });
  }
  const sessionId = await prisma.session.create({
    data: {},
  });
  cookieStore.set("id", sessionId.id);
  return Response.json(sessionId);
}
