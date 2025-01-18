"use server";

import { revalidatePath } from "next/cache";
import { connectToDB } from "@/lib/mongoose";
import Thread from "@/lib/models/thread.model";
import User from "@/lib/models/user.model";

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

export const fetchThreads = async (pageNumber = 1, pageSize = 20) => {
  try {
    await connectToDB();

    const skipAmount = (pageNumber - 1) * pageSize;
    const threadsQuery = Thread.find({
      parentId: { $in: [null, undefined] },
    })
      .sort({ createdAt: "desc" })
      .skip(skipAmount)
      .limit(pageSize)
      .populate({ path: "author", model: User })
      .populate({
        path: "children",
        populate: {
          path: "author",
          model: User,
          select: "_id name parentId image",
        },
      });

    const totalThreadCount = await Thread.countDocuments({
      parentId: { $in: [null, undefined] },
    });

    const threads = await threadsQuery.exec();
    const isNext = totalThreadCount > skipAmount + threads.length;

    return { threads, isNext };
  } catch (e: any) {
    throw new Error(`Failed to fetch threads: ${e.message}`);
  }
};
