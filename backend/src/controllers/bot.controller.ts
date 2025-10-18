import { Request, Response } from "express";
import OpenAI from "openai";
import Perplexity from "@perplexity-ai/perplexity_ai";
import { BotQuery } from "../models";

export const answerPrompt = async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Calculate start of current rolling month (30 days back)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const used = await BotQuery.countDocuments({
      user: userId,
      createdAt: { $gte: thirtyDaysAgo },
    });

    if (used >= 50) {
      res.status(429).json({
        message:
          "You have reached your GrotBot limit for this month. You'll get more access soon.",
        used,
        remaining: 0,
      });
      return;
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful rental search assistant to find users a roommate and a house. Tailor your answer towards the Netherlands, the United States, and other Western European countries. You should run web searches to learn more about the regulations and resources that might be of help to the user query. Make sure to run web search, suggest resources, and be helpful. Make sure to give your answer in plain text and not in markdown. This plain text will be showin directly in the HTML page." },
        { role: "user", content: prompt }
      ],
    });

    // Record successful bot query usage
    await BotQuery.create({ user: userId });

    const deepResearchResult = await performDeepResearch(prompt);

    res.status(200).json({
      message: `${deepResearchResult}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const performDeepResearch = async (prompt: string) => {
  const perplexityApiKey = process.env.PERPLEXITY_API_KEY;
  if (!perplexityApiKey) {
    throw new Error("Perplexity API key not configured");
  }

  const client = new Perplexity({ apiKey: perplexityApiKey });

  const search = await client.search.create({
    query: [
      prompt,
      "rental regulations Netherlands",
      "rental resources United States",
    ],
    max_results: 5,
  });

  const formattedResults = search.results
    .map((result) => `${result.title}: ${result.url}`)
    .join("\n");

  return (
    formattedResults || `No results found. Try refining your query for better matches.`
  );
};

export const getUsage = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const used = await BotQuery.countDocuments({
      user: userId,
      createdAt: { $gte: thirtyDaysAgo },
    });
    const remaining = Math.max(0, 50 - used);

    res.status(200).json({ used, remaining, limit: 50 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};