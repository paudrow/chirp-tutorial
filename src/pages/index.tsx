import { type NextPage } from "next";
import Head from "next/head";

import { api, RouterOutputs } from "@/utils/api";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { LoadingPage, LoadingSpinner } from "@/components/loading";
import {useState} from "react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { PageLayout } from "@/components/layout";

dayjs.extend(relativeTime);

const CreatePostWizard = () => {
  const {user} = useUser();
  const [input, setInput] = useState("");
  const ctx = api.useContext();

  const {mutate, isLoading: isPosting} = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate()
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to post. Please try again later.");
      }
    }
  });

  if (!user || !user.username) return null;

  return (
    <div className="flex w-full gap-3">
      <Image
        src={user.profileImageUrl}
        className="h-14 w-14 rounded-full"
        alt={`@${user.username} profile picture`}
        width={56}
        height={56}
      />
      <input
        placeholder="Type some emojis!"
        className="grow bg-transparent outline-none"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (input !== "") {
              mutate({ content: input });
            }
          }
        }}
        disabled={isPosting}
      />
      {input !== "" && !isPosting && (
        <button
          onClick={() => {
            mutate({ content: input });
          }}
        >
          Post
        </button>
      )}
      {isPosting && (
        <div className="flex items-center justify-center">
          <LoadingSpinner size={16}/>
        </div>
      )
    }
    </div>
  );
}

type PostWithUser = RouterOutputs["posts"]["getAll"][number]
const PostView = (props: PostWithUser) => {
  const {post, author} = props;
  return (
    <div key={post.id} className="flex gap-3 border-b border-slate-400 p-4">
      <Link href={`/@${author.username}`}>
        <Image
          src={author.profileImageUrl}
          className="h-14 w-14 rounded-full"
          alt={`@${author.username} profile picture`}
          width={56}
          height={56}
        />
      </Link>
      <div className="flex flex-col">
        <div className="flex gap-1 text-slate-300">
          <Link href={`/@${author.username}`}>
            <span>{`@${author.username}`}</span>
          </Link>
          <Link href={`/post/${post.id}`}>
            <span className="font-thin">
              {" "}
              · {dayjs(post.createdAt).fromNow()}
            </span>
          </Link>
        </div>
        <span className="text-2xl">{post.content}</span>
      </div>
    </div>
  );
}

const Feed = () => {
  const {data, isLoading: dataLoading} = api.posts.getAll.useQuery();

  if (dataLoading) return <LoadingPage />

  if (!data) return <div>Something went wrong</div>

  return (
    <div className="flex flex-col">
      {data?.map((postWithAuthor) => (
        <PostView key={postWithAuthor.post.id} {...postWithAuthor} />
      ))}
    </div>
  );
}


const Home: NextPage = () => {
  const {isLoaded: userLoaded, isSignedIn} = useUser();

  // Start fetching posts ASAP (use cached data elsewhere)
  api.posts.getAll.useQuery();

  // RETURN empty div if user is not loaded
  if (!userLoaded) return <div />

  return (
    <PageLayout>
      <div className="border-b border-slate-400 p-4">
        {!isSignedIn && (
          <div className="flex justify-center">
            <SignInButton />
          </div>
        )}
        {!!isSignedIn && <CreatePostWizard />}
      </div>
      <Feed />
    </PageLayout>
  );
};

export default Home;
