import { currentUser } from "@clerk/nextjs";
import { fetchThreads } from "@/lib/actions/thread.actions";
import { ThreadCard } from "@/components/cards";

export default async function Home() {
  const user = await currentUser();
  if (!user) {
    return null;
  }

  const { threads } = await fetchThreads(1, 30);

  return (
    <>
      <h1 className="head-text text-left">Home</h1>
      <section className="mt-9 flex flex-col gap-10">
        {threads.length === 0 ? (
          <p className="no-result">No threads found</p>
        ) : (
          <>
            {threads.map((thread) => (
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
            ))}
          </>
        )}
      </section>
    </>
  );
}
