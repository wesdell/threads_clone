"use server";

import { connectToDB } from "@/lib/mongoose";
import Thread from "@/lib/models/thread.model";
import User from "@/lib/models/user.model";
import { revalidatePath } from "next/cache";

interface Params {
  author: string;
  text: string;
  communityId: string | null;
  path: string;
}

export const createThread = async ({
  author,
  text,
  communityId,
  path,
}: Params) => {
  try {
    await connectToDB();

    const createdThread = await Thread.create({
      text,
      author,
      community: null,
    });

    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread._id },
    });

    revalidatePath(path);
  } catch (e: any) {
    throw new Error(`Error creating thread: ${e.message}`);
  }
};
