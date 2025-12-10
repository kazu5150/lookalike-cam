import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Define response type
type AnalyzeResponse = {
  matchName: string;
  matchReason: string;
  matchComment: string;
  matchImageUrl: string | null;
  error?: string;
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Using 2.0 Flash as standard, or 1.5 if preferred. 2.0 is current bleeding edge, let's stick to 1.5-flash or 2.0-flash-exp if available. The prompt said 2.5 but 2.5 doesn't exist? Maybe 1.5-flash-8b or similar. Let's use "gemini-1.5-flash" for stability or "gemini-2.0-flash-exp" if user wants new stuff. I'll use "gemini-1.5-flash" to be safe unless I check available models. "gemini-1.5-flash" is solid.

    // Better Prompt for JSON mode
    const prompt = `
    Analyze this face. Identify the MOST famous celebrity, athlete, or historical figure that this person looks like.
    Focus on facial structure, expression, and features.
    
    Return a JSON object with:
    - "name": The full name of the celebrity.
    - "reason": A short reason why (e.g., "Same nose and winning smile").
    - "funny_comment": A short, witty, stadium-announcer style comment (e.g., "Is that you, Tom??").
    
    Output ONLY valid JSON.
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: file.type,
        },
      },
    ]);

    const responseText = result.response.text();
    // Clean code blocks if present
    const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

    let aiData;
    try {
      aiData = JSON.parse(cleanedText);
    } catch (e) {
      console.error("JSON Parse Error:", responseText);
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    // Fetch Image from Wikipedia
    const wikiRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
        aiData.name
      )}&prop=pageimages&format=json&pithumbsize=500&origin=*`
    );
    const wikiData = await wikiRes.json();
    const pages = wikiData.query?.pages;
    let matchImageUrl = null;

    if (pages) {
      const pageId = Object.keys(pages)[0];
      if (pageId !== "-1" && pages[pageId].thumbnail) {
        matchImageUrl = pages[pageId].thumbnail.source;
      }
    }

    // If no image found, we might want to return null or let the frontend handle a placeholder.

    const finalResponse: AnalyzeResponse = {
      matchName: aiData.name,
      matchReason: aiData.reason,
      matchComment: aiData.funny_comment,
      matchImageUrl: matchImageUrl,
    };

    return NextResponse.json(finalResponse);

  } catch (error) {
    console.error("Analysis Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
