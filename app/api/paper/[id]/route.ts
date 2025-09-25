// app/api/paper/[id]/route.ts
import { NextResponse } from "next/server";
import { getPaperQuestions } from "@/lib/db-admin";

interface Params {
  params: {
    id: string;
  };
}

export async function GET(req: Request, { params }: Params) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Missing paper ID" }, { status: 400 });
    }

    const paper = await getPaperQuestions(id);

    if (!paper) {
      return NextResponse.json({ error: "Paper not found" }, { status: 404 });
    }

    return NextResponse.json(paper);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// in your frontend React code
//   async function fetchPaper(paperId: string) {
//     const res = await fetch("/api/paper/demoPaper");
//     if (!res.ok) throw new Error("Paper not found");
//     return await res.json();
//   }

//   // usage
//   useEffect(() => {
//     fetchPaper("demoPaper").then(console.log).catch(console.error);
//   }, []);
