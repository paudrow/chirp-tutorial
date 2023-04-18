import { createServerSideHelpers } from "@trpc/react-query/server";
import { prisma } from "@/server/db";
import { appRouter } from "@/server/api/root";
import superjson from "superjson";

export const generateSsgHelper = () => {
  return createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, currentUserId: null },
    transformer: superjson,
  });
};
