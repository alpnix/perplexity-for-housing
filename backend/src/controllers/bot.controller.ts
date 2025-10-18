import { Request, Response } from "express";
import OpenAI from "openai";
import Perplexity from "@perplexity-ai/perplexity_ai";
import { BotQuery } from "../models";

interface CategoryInfo {
  hasInfo: boolean;
  details: string;
  keywords: string[];
}

interface HousingQueryAnalysis {
  isHousingRelated: boolean;
  location: string;
  houses: CategoryInfo;
  roommates: CategoryInfo;
  laws: CategoryInfo;
}

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

    // DEV ONLY
    if (used >= 5000) {
      res.status(429).json({
        message:
          "You have reached your OwlBot limit for this month. You'll get more access soon.",
        used,
        remaining: 0,
      });
      return;
    }

    // Record successful bot query usage
    await BotQuery.create({ user: userId });

    // Set up Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // Send initial analysis
    const housingPromptCategory = await classifyHousingPrompt(prompt);
    
    // Send the chain of thought analysis to frontend
    res.write(`data: ${JSON.stringify({
      type: 'analysis',
      data: housingPromptCategory
    })}\n\n`);

    // Send database search status
    res.write(`data: ${JSON.stringify({
      type: 'status',
      data: { message: '🔍 Searching our database for relevant properties and roommates...' }
    })}\n\n`);

    const databaseSearchResult = await searchDatabase(JSON.stringify(housingPromptCategory));

    // Send database search results
    res.write(`data: ${JSON.stringify({
      type: 'database_result',
      data: {
        result: databaseSearchResult,
        searchQueries: databaseSearchResult.metadata?.queriesExecuted || [
          `Retrieved all houses from database for AI matching`,
          `Retrieved all roommates from database for AI matching`,
          `AI matching completed`
        ],
        executionTime: `${databaseSearchResult.metadata?.executionTime || 0}ms`,
        totalResults: databaseSearchResult.metadata?.totalResults || 0,
        housesFound: databaseSearchResult.houses?.length || 0,
        roommatesFound: databaseSearchResult.roommates?.length || 0
      }
    })}\n\n`);

    // Send web search status
    res.write(`data: ${JSON.stringify({
      type: 'status',
      data: { message: '🌐 Searching the entire web for comprehensive information...' }
    })}\n\n`);

    // Perform deep research and send final result
    try {
      // Create intelligent prompt based on user intent
      const researchPrompt = createIntelligentResearchPrompt(prompt, housingPromptCategory);
      const deepResearchResult = await performDeepResearch(researchPrompt);

      // Send final result
      res.write(`data: ${JSON.stringify({
        type: 'result',
        data: { message: deepResearchResult }
      })}\n\n`);
    } catch (researchError) {
      console.error('Deep research error:', researchError);
      res.write(`data: ${JSON.stringify({
        type: 'error',
        data: { message: 'Sorry, I encountered an error while researching your query. Please try again.' }
      })}\n\n`);
    }

    // End the stream
    res.write(`data: ${JSON.stringify({ type: 'end' })}\n\n`);
    res.end();

  } catch (error) {
    console.error(error);
    
    // If headers haven't been sent yet, send JSON error
    if (!res.headersSent) {
      res.status(500).json({ message: "Internal server error" });
    } else {
      // If we're in the middle of streaming, send error via SSE
      res.write(`data: ${JSON.stringify({
        type: 'error',
        data: { message: 'Internal server error' }
      })}\n\n`);
      res.end();
    }
  }
};

const classifyHousingPrompt = async (prompt: string): Promise<HousingQueryAnalysis> => {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { 
        role: "system", 
        content: `You are a housing query analyzer. Extract and expand key information from the user's query into three categories:

1. "houses": Extract property requirements (style, size, location, amenities, budget, type)
2. "roommates": Extract roommate preferences (number, type, lifestyle, demographics)
3. "laws": Extract legal/regulatory concerns (tenant rights, contracts, regulations, specific legal questions)

For each category, provide:
- "hasInfo": boolean indicating if the query mentions this category
- "details": string with expanded search terms for deep research (empty string if hasInfo is false)
- "keywords": array of key search terms

Also include:
- "isHousingRelated": boolean indicating if this is a housing query
- "location": string with the primary location mentioned (empty if none)

Return valid JSON only. Example:
{
  "isHousingRelated": true,
  "location": "London, near UCL",
  "houses": {
    "hasInfo": true,
    "details": "Swedish style cozy house near University College London with modern amenities and natural light",
    "keywords": ["Swedish style", "cozy", "UCL", "London", "house"]
  },
  "roommates": {
    "hasInfo": true,
    "details": "Looking for 4 other university students as roommates with similar academic lifestyle",
    "keywords": ["4 students", "university", "UCL students"]
  },
  "laws": {
    "hasInfo": false,
    "details": "",
    "keywords": []
  }
}` 
      },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" }
  });
  return JSON.parse(response.choices[0].message.content as string);
};

const searchDatabase = async (analysisString: string) => {
  try {
    const analysis = JSON.parse(analysisString) as HousingQueryAnalysis;
    
    // Import models dynamically to avoid circular dependencies
    const { House, RoommateInterest, Match } = await import('../models');
    
    const results: any = {
      houses: [],
      roommates: [],
      laws: [],
      metadata: {
        queriesExecuted: [],
        totalResults: 0,
        executionTime: Date.now()
      }
    };

    // Retrieve ALL houses and roommates from database for AI comparison
    let allHouses: any[] = [];
    let allRoommates: any[] = [];

    try {
      // Get all houses from database
      if (analysis.houses?.hasInfo) {
        allHouses = await House.find({}).lean();
        results.metadata.queriesExecuted.push(`Retrieved ${allHouses.length} houses from database for AI matching`);
      }

      // Get all roommates from database  
      if (analysis.roommates?.hasInfo) {
        allRoommates = await RoommateInterest.find({}).lean();
        results.metadata.queriesExecuted.push(`Retrieved ${allRoommates.length} roommates from database for AI matching`);
      }

      // Use AI to find matches if we have data
      if (allHouses.length > 0 || allRoommates.length > 0) {
        const aiMatches = await findAIMatches(analysis, allHouses, allRoommates);
        
        // Format house matches
        if (aiMatches.houses && aiMatches.houses.length > 0) {
          results.houses = aiMatches.houses.map((house: any) => ({
            title: house.title || `${house.type} in ${house.location}`,
            location: house.location || house.address || house.city,
            price: house.price ? `${house.currency || '$'}${house.price}` : 'Price on request',
            description: house.description || `${house.bedrooms || 'N/A'} bedroom ${house.type} with ${house.amenities?.length || 0} amenities`,
            amenities: house.amenities || [],
            image_url: house.images?.[0] || house.imageUrl || '',
            source_url: house.sourceUrl || house.url || '',
            verified: true,
            availability_status: house.status || 'Available',
            match_score: house.match_score || 0.8
          }));
        }

        // Format roommate matches
        if (aiMatches.roommates && aiMatches.roommates.length > 0) {
          results.roommates = aiMatches.roommates.map((roommate: any) => ({
            name: roommate.name || 'Anonymous User',
            age: roommate.age?.toString() || 'N/A',
            occupation: roommate.occupation || 'Not specified',
            interests: roommate.interests || [],
            budget: roommate.budget ? `${roommate.currency || '$'}${roommate.budget}` : 'Budget flexible',
            preferred_location: roommate.preferences?.location || analysis.location || 'Flexible',
            description: roommate.bio || roommate.description || `${roommate.occupation} looking for housing in ${roommate.preferences?.location || 'various locations'}`,
            contact_method: 'Through platform',
            match_score: roommate.match_score || 0.8
          }));
        }

        results.metadata.totalResults = results.houses.length + results.roommates.length;
        results.metadata.queriesExecuted.push(`AI matching completed: ${results.houses.length} house matches, ${results.roommates.length} roommate matches`);
      }

    } catch (error) {
      console.error('Database retrieval error:', error);
      results.metadata.queriesExecuted.push(`Error retrieving data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // For laws, we'll return general legal information since we don't have a laws collection
    if (analysis.laws?.hasInfo) {
      results.laws = [
        {
          title: "Tenant Rights Information",
          description: "General tenant rights and housing regulations for the specified location",
          jurisdiction: analysis.location || "General",
          source_url: "",
          relevance: "Provides basic tenant protection information",
          last_updated: new Date().toISOString().split('T')[0]
        }
      ];
      results.metadata.queriesExecuted.push(`Laws: General legal information for ${analysis.location || 'general jurisdiction'}`);
    }

    results.metadata.executionTime = Date.now() - results.metadata.executionTime;
    return results;
    
  } catch (error) {
    console.error('Database search error:', error);
    return {
      houses: [],
      roommates: [],
      laws: [],
      metadata: {
        queriesExecuted: ['Error executing database queries'],
        totalResults: 0,
        executionTime: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
};

const findAIMatches = async (analysis: HousingQueryAnalysis, allHouses: any[], allRoommates: any[]) => {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  const prompt = `You are an AI matching system for housing and roommates. 

USER REQUIREMENTS:
- Location: ${analysis.location || 'Not specified'}
- Houses needed: ${analysis.houses?.hasInfo ? 'YES' : 'NO'}
  ${analysis.houses?.hasInfo ? `Details: ${analysis.houses.details}\nKeywords: ${analysis.houses.keywords?.join(', ')}` : ''}
- Roommates needed: ${analysis.roommates?.hasInfo ? 'YES' : 'NO'}
  ${analysis.roommates?.hasInfo ? `Details: ${analysis.roommates.details}\nKeywords: ${analysis.roommates.keywords?.join(', ')}` : ''}

AVAILABLE HOUSES IN DATABASE:
${JSON.stringify(allHouses.slice(0, 50), null, 2)} // Limit to first 50 for token limits

AVAILABLE ROOMMATES IN DATABASE:
${JSON.stringify(allRoommates.slice(0, 50), null, 2)} // Limit to first 50 for token limits

TASK:
Analyze the user requirements and find the BEST MATCHES from the database. Consider:
1. Location compatibility (exact match, nearby areas, or flexible)
2. Budget compatibility (if specified)
3. Lifestyle compatibility (for roommates)
4. Property type and amenities (for houses)
5. Preferences and keywords match

Return ONLY the matching items with a match_score (0.0 to 1.0) indicating how well they match.
Return a maximum of 10 houses and 8 roommates, ordered by match_score (highest first).

IMPORTANT: Only return items that have a match_score >= 0.6 (good matches or better).

Response format:
{
  "houses": [
    { ...original_house_data, "match_score": 0.95, "match_reason": "Perfect location and budget match" }
  ],
  "roommates": [
    { ...original_roommate_data, "match_score": 0.87, "match_reason": "Compatible lifestyle and location" }
  ]
}`;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an expert AI matching system for housing and roommates. Analyze user requirements and find the best matches from the database." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3 // Lower temperature for more consistent matching
    });

    const matches = JSON.parse(response.choices[0].message.content as string);
    
    // Filter and sort results
    const filteredHouses = (matches.houses || [])
      .filter((house: any) => house.match_score >= 0.6)
      .sort((a: any, b: any) => b.match_score - a.match_score)
      .slice(0, 10);
      
    const filteredRoommates = (matches.roommates || [])
      .filter((roommate: any) => roommate.match_score >= 0.6)
      .sort((a: any, b: any) => b.match_score - a.match_score)
      .slice(0, 8);

    return {
      houses: filteredHouses,
      roommates: filteredRoommates
    };
    
  } catch (error) {
    console.error('AI matching error:', error);
    return {
      houses: [],
      roommates: []
    };
  }
};

const createIntelligentResearchPrompt = (originalPrompt: string, analysis: HousingQueryAnalysis): string => {
  let prompt = `Based on the user query: "${originalPrompt}"\n\n`;
  
  // Focus areas based on analysis
  const focusAreas = [];
  if (analysis.houses?.hasInfo) focusAreas.push('properties/houses');
  if (analysis.roommates?.hasInfo) focusAreas.push('roommates');
  if (analysis.laws?.hasInfo) focusAreas.push('legal information');
  
  prompt += `FOCUS AREAS: ${focusAreas.join(', ')}\n\n`;
  
  if (analysis.houses?.hasInfo) {
    prompt += `PROPERTY SEARCH REQUIREMENTS:
- Search for MULTIPLE REAL, VERIFIED properties (aim for 15-25 individual listings)
- Focus on INDIVIDUAL RENTAL PROPERTIES, not just general information
- Each property should be a specific, rentable unit with exact details
- Validate all property links and ensure they are working
- Include properties with accurate pricing and descriptions
- Search extensively across multiple property websites (Hemnet, Blocket, Booli, Qasa, Bostadsportal, etc.)
- Verify property availability and current status
- Include both properties with and without images
- Prioritize VARIETY: different price ranges, locations, and property types
- Property details: ${analysis.houses.details}
- Keywords: ${analysis.houses.keywords?.join(', ')}

IMPORTANT FOR HOUSES: Return as many individual rental listings as possible. Each entry should represent a specific apartment/house that someone can actually rent, not generic information.

`;
  }
  
  if (analysis.roommates?.hasInfo) {
    prompt += `ROOMMATE SEARCH REQUIREMENTS:
- Focus on finding compatible roommate profiles
- Include detailed preferences and lifestyle information
- Roommate details: ${analysis.roommates.details}
- Keywords: ${analysis.roommates.keywords?.join(', ')}

`;
  }
  
  if (analysis.laws?.hasInfo) {
    prompt += `LEGAL INFORMATION REQUIREMENTS:
- Provide relevant housing laws and regulations
- Include jurisdiction-specific information
- Legal concerns: ${analysis.laws.details}
- Keywords: ${analysis.laws.keywords?.join(', ')}

`;
  }
  
  prompt += `IMPORTANT INSTRUCTIONS:
1. VERIFY all property links before including them
2. Only include REAL properties that are currently available
3. For properties: Search extensively across multiple platforms and return MANY individual listings (15-25+ properties)
4. Each house entry must be a SPECIFIC RENTAL UNIT with exact address, price, and details
5. Validate image URLs and ensure they work
6. Return results in the specified JSON format
7. Focus ONLY on the requested categories (${focusAreas.join(', ')})
8. If user only wants houses, return empty arrays for roommates and laws BUT maximize house listings
9. If user only wants roommates, focus on roommate matching
10. If user only wants legal info, focus on housing laws and regulations
11. PRIORITIZE QUANTITY: More individual rental listings = better results
12. Include variety in price ranges, sizes, and locations within the specified area

Location: ${analysis.location || 'Not specified'}

CRITICAL: For housing searches, the goal is to provide as comprehensive a list of individual rental properties as possible. Think of this as creating a rental listing aggregator result.`;

  return prompt;
};

const performDeepResearch = async (prompt: string) => {
  const perplexityApiKey = process.env.PERPLEXITY_API_KEY;
  if (!perplexityApiKey) {
    throw new Error("Perplexity API key not configured");
  }

  const client = new Perplexity({ apiKey: perplexityApiKey });

  const completion = await client.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    model: 'sonar-pro',
    search_domain_filter: [], // Remove filter to search all domains for real properties
    return_images: true,
    return_related_questions: false,
    search_recency_filter: 'month',
    response_format: {
      type: 'json_schema',
      json_schema: {
        schema: {
          type: 'object',
          properties: {
            houses: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  location: { type: 'string' },
                  price: { type: 'string' },
                  description: { type: 'string' },
                  amenities: { type: 'array', items: { type: 'string' } },
                  image_url: { type: 'string' },
                  source_url: { type: 'string' },
                  verified: { type: 'boolean' },
                  availability_status: { type: 'string' }
                },
                required: ['title', 'location', 'price', 'description', 'verified']
              }
            },
            roommates: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  age: { type: 'string' },
                  occupation: { type: 'string' },
                  interests: { type: 'array', items: { type: 'string' } },
                  budget: { type: 'string' },
                  preferred_location: { type: 'string' },
                  description: { type: 'string' },
                  contact_method: { type: 'string' }
                },
                required: ['name', 'occupation', 'description']
              }
            },
            laws: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  jurisdiction: { type: 'string' },
                  source_url: { type: 'string' },
                  relevance: { type: 'string' },
                  last_updated: { type: 'string' }
                },
                required: ['title', 'description', 'jurisdiction']
              }
            },
            summary: { type: 'string' },
            search_metadata: {
              type: 'object',
              properties: {
                properties_searched: { type: 'number' },
                verified_properties: { type: 'number' },
                sources_checked: { type: 'array', items: { type: 'string' } }
              }
            }
          },
          required: ['summary']
        }
      }
    }
  });

  return completion.choices[0].message.content;
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