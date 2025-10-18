## User Prompt 

1. If user's prompt is not anything housing related, we reply with asking for a housing query
2. User's housing query is broken down into a few topics such as houses, roommates, laws
3. First the database is searched for contant look up time on each one of these categories
4. If no relevant queries are found in the database, deep research is performed for the relevant fields
5. As Deep Research is being performed, relevant CoT steps are being displayed to the user
6. Once all the results are received, they are saved to the database, and displayed neatly to the user maybe in another tab
7. If a user doesn't receive much results or likes that prompt, they can choose to set that as an repeating agent that would search up the same query every 24 hours or so


## Design

Steps 1-2 can be done using a OpenAI Chat Completions API. After getting the relevant structure of query, this will be used to search in the MongoDB database. After ending the search in the database, make sure to run deep research with Perplexity's Sonar models. After the results are retrieved, they should all be returned to the user in a format that can be displayed well in the frontend UI. 

Each step in user prompt journey should be displayed in the UI with relevant symbols and status text. 
Think more about the visualizations. Make sure it looks visally appealing. Make sure it looks like there is deep search going on. Keep the users informed about what's happening. 



## Judging Criteria

Perplexity for Housing
- Perplexity Chat completions (https://docs.perplexity.ai/api-reference/chat-completions-post)
- Sonar Deep Research (https://docs.perplexity.ai/getting-started/models/models/sonar-deep-research)
- Media Classification (https://docs.perplexity.ai/guides/media-classifier)

Technological Implementation
 Does the project demonstrate strong software development? Does it effectively leverage the required tools? How is the overall code quality?
Design
 Is the user experience well thought out? Does the project strike a good balance between frontend and backend implementation?
Potential Impact
 What’s the potential impact on the target audience — and beyond?
Quality of the Idea
 How creative and original is the concept? If similar ideas exist, how much does this project improve on them?