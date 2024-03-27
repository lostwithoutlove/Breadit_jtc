"use client";
import { FC, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

interface PostVoteClientProps {}

const PostVoteClient = async ({}) => {
  return (
    <div>
      <p>Post Vote Client</p>
    </div>
  );
};

export default PostVoteClient;
