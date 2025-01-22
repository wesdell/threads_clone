"use server";

import { revalidatePath } from "next/cache";
import { FilterQuery, SortOrder } from "mongoose";
import { connectToDB } from "@/lib/mongoose";
import User from "@/lib/models/user.model";
import Thread from "@/lib/models/thread.model";

interface Params {
  userId: string;
  username: string;
  name: string;
  bio: string;
  image: string;
  path: string;
}

export const updateUser = async ({
  userId,
  username,
  name,
  bio,
  image,
  path,
}: Params): Promise<void> => {
  try {
    await connectToDB();
    await User.findOneAndUpdate(
      { id: userId },
      { username: username.toLowerCase(), name, bio, image, onboarded: true },
      { upsert: true },
    );

    if (path === "/profile/edit") {
      revalidatePath(path);
    }
  } catch (e: any) {
    throw new Error(`Failed to create/update a user: ${e.message}`);
  }
};

export const fetchUser = async (userId: string) => {
  try {
    await connectToDB();
    return await User.findOne({ id: userId });
  } catch (e: any) {
    throw new Error(`Failed to fetch user: ${e.message}`);
  }
};

export const fetchUsers = async ({
  userId,
  pageNumber = 1,
  pageSize = 20,
  searchString = "",
  sortBy = "desc",
}: {
  userId: string;
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: SortOrder;
}) => {
  try {
    await connectToDB();
    const skipAmount = (pageNumber - 1) * pageSize;
    const regex = new RegExp(searchString, "i");

    const query: FilterQuery<typeof User> = { id: { $ne: userId } };
    if (searchString.trim() !== "") {
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ];
    }

    const sortOptions = { createdAt: sortBy };
    const usersQuery = User.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize);

    const totalUsersCount = await User.countDocuments(query);
    const users = await usersQuery.exec();
    const isNext = totalUsersCount > skipAmount + users.length;

    return { users, isNext };
  } catch (e: any) {
    throw new Error(`Failed to fetch users: ${e.message}`);
  }
};

export const fetchUserThreads = async (userId: string) => {
  try {
    await connectToDB();
    return await User.findOne({ id: userId }).populate({
      path: "threads",
      model: Thread,
      populate: {
        path: "children",
        model: Thread,
        populate: {
          path: "author",
          model: User,
          select: "name image id",
        },
      },
    });
  } catch (error: any) {
    throw new Error(`Failed to fetch user threads: ${error.message}`);
  }
};
