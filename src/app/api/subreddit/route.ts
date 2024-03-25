import { getAuthSession } from "@/lib/auth";
import { z } from "zod";
import { SubredditValidator } from "@/lib/validators/subreddit";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("User Not Logged in", { status: 401 });
    }

    const body = await req.json();
    const { name } = SubredditValidator.parse(body);

    //check if subreddit already exists
    const subredditExists = await db.subreddit.findFirst({
      where: {
        name,
      },
    });

    if (subredditExists) {
      return new Response("Subreddit already exists", { status: 409 });
    }

    // create subreddit and associate it with the user
    const subreddit = await db.subreddit.create({
      data: {
        name,
        creatorId: session.user.id,
      },
    });

    // creator also has to be subscribed
    await db.subscription.create({
      data: {
        userId: session.user.id,
        subredditId: subreddit.id,
      },
    });

    return new Response(subreddit.name);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 });
    }

    return new Response("Could not create subreddit", { status: 500 });
  }
}
