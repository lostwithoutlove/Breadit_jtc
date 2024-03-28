import { getAuthSession } from "@/lib/auth";
import { PostVoteValidator } from "@/lib/validators/vote";
import { db } from "@/lib/db";
import { CachedPost } from "@/types/redis";
import { z } from "zod";
import { redis } from "@/lib/redis";

const CACHE_AFTER_UPVOTES = 1;

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    const { postId, voteType } = PostVoteValidator.parse(body);

    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // check if user has already voted on this post
    const existingVote = await db.vote.findFirst({
      where: {
        userId: session.user.id,
        postId,
      },
    });

    //Find the post
    const post = await db.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        author: true,
        votes: true,
      },
    });
    if (!post) {
      return new Response("Post not found", { status: 404 });
    }

    //Check Existing Vote type
    if (existingVote) {
      if (existingVote.type === voteType) {
        await db.vote.delete({
          where: {
            userId_postId: {
              postId,
              userId: session.user.id,
            },
          },
        });
        return new Response("OK1");
      }

      // if vote type is different, update the vote
      await db.vote.update({
        where: {
          userId_postId: {
            postId,
            userId: session.user.id,
          },
        },
        data: {
          type: voteType,
        },
      });

      // Recount the votes
      const votesAmt = post.votes.reduce((acc, vote) => {
        if (vote.type === "UP") return acc + 1;
        if (vote.type === "DOWN") return acc - 1;
        return acc;
      }, 0);

      if (votesAmt >= CACHE_AFTER_UPVOTES) {
        const cachePayload: CachedPost = {
          authorUsername: post.author.username ?? "",
          content: JSON.stringify(post.content),
          id: post.id,
          title: post.title,
          currentVote: null,
          createdAt: post.createdAt,
        };

        // Store the post data as a hash
        await redis.hset(`post:${postId}`, cachePayload);
      }
      return new Response("OK2");
    }

    // if vote type is different, update the vote
    await db.vote.update({
      where: {
        userId_postId: {
          postId,
          userId: session.user.id,
        },
      },
      data: {
        type: voteType,
      },
    });

    // Recount the votes
    const votesAmt = post.votes.reduce((acc, vote) => {
      if (vote.type === "UP") return acc + 1;
      if (vote.type === "DOWN") return acc - 1;
      return acc;
    }, 0);

    if (votesAmt >= CACHE_AFTER_UPVOTES) {
      const cachePayload: CachedPost = {
        authorUsername: post.author.username ?? "",
        content: JSON.stringify(post.content),
        id: post.id,
        title: post.title,
        currentVote: voteType,
        createdAt: post.createdAt,
      };
      // Store the post data as a hash
      await redis.hset(`post:${postId}`, cachePayload);
    }

    return new Response("OK");
  } catch (error) {
    error;
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 400 });
    }
    return new Response("Could not register your vote. Please try later", {
      status: 500,
    });
  }
}
