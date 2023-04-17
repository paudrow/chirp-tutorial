import { z } from "zod";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { createTRPCRouter, privateProcedure, publicProcedure } from "@/server/api/trpc";
import clerkClient, { User } from "@clerk/clerk-sdk-node";
import { TRPCError } from "@trpc/server";
import { filterUserFromClient } from "@/server/helpers/filterUserFromClient";

export const profileRouter = createTRPCRouter({
  getUserByUsername: publicProcedure
    .input(
      z.object({
        username: z.string(),
      })
    )
    .query(async ({ input }) => {
      const [user] = await clerkClient.users.getUserList({
        username: [input.username],
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return filterUserFromClient(user);
    }),
});
