import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType, type NextPage } from "next";
import Head from "next/head";

import { api } from "@/utils/api";
import { PageLayout } from "@/components/layout";
import Image from "next/image";
import { PostView } from "@/components/postview";

const ProfileFeed = (props: {userId: string}) => {
  const {data, isLoading } = api.posts.getPostByUserId.useQuery({
    userId: props.userId,
  });

  if (isLoading) return <LoadingPage />

  if (!data || data.length === 0) return <div>User has not posted</div>

  return (
    <div className="flex flex-col">
      {data.map(({post, author}) => (
        <PostView key={post.id} post={post} author={author} />
      ))}
    </div>
  )}

const ProfilePage: NextPage<{username: string}> = ({username}) => {

  const {data: user } = api.profile.getUserByUsername.useQuery({ username });

  if (!user || !user.username) return <div>User not found</div>

  return (
    <>
      <Head>
        <title>{username}</title>
        <meta name="description" content="Generated by create-t3-app" />
      </Head>
      <PageLayout>
        <div className="h-36 bg-slate-600 relative">
          <Image
            src={user.profileImageUrl}
            alt={`@${user.username} profile picture`}
            width={128}
            height={128}
            className="rounded-full -mb-[64px] absolute bottom-0 left-0 ml-4 border-4 border-black bg-black"
          />
        </div >
        <div className="h-[64px]"/>
        <div className="p-4 text-2xl font-bold">{`@${user.username}`}</div>
        <div className="border-b border-slate-400 w-full"/>
        <ProfileFeed userId={user.id} />
      </PageLayout>
    </>
  );
};

import { createServerSideHelpers } from '@trpc/react-query/server';
import { prisma } from "@/server/db";
import { appRouter } from "@/server/api/root";
import superjson from "superjson";
import { LoadingPage } from "@/components/loading";

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: {prisma, currentUserId: null},
    transformer: superjson,
  });

  const slug = context.params?.slug;
  if (typeof slug !== "string") throw new Error("Slug is not a string");
  const username = slug.replace("@", "");

  await ssg.profile.getUserByUsername.prefetch({ username });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username,
    },
  }
}

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
}

export default ProfilePage;
