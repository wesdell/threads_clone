import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs";
import { fetchUser } from "@/lib/actions/user.actions";
import { fetchThreadById } from "@/lib/actions/thread.actions";
import { ThreadCard } from "@/components/cards";
import { Comment } from "@/components/forms";

export default async function ThreadByIdPage({
  params,
}: {
  params: { id: string };
}) {
  if (!params.id) {
    return null;
  }

  const user = await currentUser();
  if (!user) {
    return null;
  }

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) {
    redirect("/onboarding");
  }

  const thread = await fetchThreadById(params.id);

  return (
    <section className="relative">
      <div>
        <ThreadCard
          key={thread._id}
          id={thread.id}
          currentUserId={user.id}
          parentId={thread.parentId}
          content={thread.text}
          author={thread.author}
          community={thread.community}
          createdAt={thread.createdAt}
          comments={thread.children}
        />
      </div>
      <div className="mt-7">
        <Comment
          threadId={thread.id}
          currentUserId={JSON.stringify(userInfo._id)}
          currentUserImg={userInfo.image}
        />
      </div>
      <div className="mt-10">
        {thread.children.map((item: any) => (
          <ThreadCard
            key={item._id}
            id={item._id}
            currentUserId={user.id}
            parentId={item.parentId}
            content={item.text}
            author={item.author}
            community={item.community}
            createdAt={item.createdAt}
            comments={item.children}
            isComment
          />
        ))}
      </div>
    </section>
  );
}
