import React, { useEffect, useState } from "react";
import { useMutation, gql } from "@apollo/client";

const CREATE_COMMENT = gql`
  mutation createNewComment($input: CommentInput!) {
    createComment(input: $input) {
      name
    }
  }
`;

const DELETE_POST = gql`
  mutation deletePost($postId: Int!) {
    deletePost(input: {
      postId: $postId
    })
  }
`;

export default function PostCard(props) {
  const [imageUrl, setImageUrl] = useState("");
  const [comment, setComment] = useState(null);

  const generateNewImage = async () => {
    const res = await fetch("https://picsum.photos/800/400");
    setImageUrl(res.url);
  };

  useEffect(() => {
    generateNewImage();
  }, []);

  const [mutate, { data, loading, error }] = useMutation(CREATE_COMMENT);
  const [mutateDel] = useMutation(DELETE_POST)
  if (loading) return <p>Creating comment ...</p>;
  if (error) return <p>error occured: {error.message}</p>;

  function handleCommentChange(event) {
    setComment(event.target.value);
  }

  async function handleDelete() {
    console.log("postId:", props.postId);
    console.log("DELETE_POST mutation:", DELETE_POST);
    await mutateDel({
      variables: {
        postId: props.postId,
      },
    });
    await props.refetch();
  }

  async function submitComment() {
    if (!comment) return;

    await mutate({
      variables: {
        input: {
          postId: props.postId,
          name: comment,
        },
      },
    });

    await props.refetch();

    setComment(null);
    console.log(data);
  }

  return (
    <>
      <div className="mt-4 ml-4 max-w-sm rounded overflow-hidden shadow-lg">
        <img className="w-full" src={imageUrl} alt="{props.title}" />
        <div className="px-6 py-4">
          <div className="font-bold text-xl mb-2">
            {props.title}
          </div>
          <p className="text-gray-700 text-base">
            {props.body}
          </p>
        </div>
        <button onClick={handleDelete} className="bg-red-500 p-2 rounded">Delete Post</button>
        <div className="px-6 pt-4 pb-2">
          <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
            comments
          </span>
          {props.comments.map((comment) => (
          <li key={comment.id}>
            {comment.name}
          </li>
          ))}
          <input
            placeholder="Write your comment ..."
            onChange={handleCommentChange}
          />
          <button onClick={submitComment}>Add</button>
        </div>
      </div>
    </>
  );
}
