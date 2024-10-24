// import { NextRequest, NextResponse } from "next/server";
// import { callChain } from "@/lib/langchain";
// import { Message } from "ai";
// import {
//   retrieveRelevantChunks,
//   generateAnswer,
// } from "./../../../lib/generate-answer";

// const formatMessage = (message: Message) => {
//   return `${message.role === "user" ? "Human" : "Assistant"}: ${
//     message.content
//   }`;
// };

// export async function POST(req: NextRequest) {
//   const body = await req.json();
//   const messages: Message[] = body.messages ?? [];
//   console.log("Messages ", messages);
//   const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
//   const question = messages[messages.length - 1].content;

//   console.log("question ", question);

//   if (!question) {
//     return NextResponse.json("Error: No question in the request", {
//       status: 400,
//     });
//   }

//   try {
//     // const streamingTextResponse = callChain({
//     //   question,
//     //   chatHistory: formattedPreviousMessages.join("\n"),
//     // });

//     // return streamingTextResponse;
//     const relevantChunksMatchingQuery = await retrieveRelevantChunks(question);
//     console.log("relevantChunksMatchingQuery", relevantChunksMatchingQuery);
//     const answer = await generateAnswer(question, relevantChunksMatchingQuery);
//     console.log("answer", answer);
//     return NextResponse.json(answer, { status: 200 });
//   } catch (error) {
//     console.error("Internal server error ", error);
//     return NextResponse.json("Error: Something went wrong. Try again!", {
//       status: 500,
//     });
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import { callChain } from "@/lib/langchain";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const question = body.message;

  if (!question) {
    return NextResponse.json("Error: No question in the request", {
      status: 400,
    });
  }

  try {
    const textResponse = await callChain({
      question,
    });

    return NextResponse.json({ message: textResponse }, { status: 200 });
  } catch (error) {
    console.error("Internal server error ", error);
    return NextResponse.json("Error: Something went wrong. Try again!", {
      status: 500,
    });
  }
}
