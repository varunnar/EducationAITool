import { GoogleGenAI } from "@google/genai"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });


const context = `For this request, keep a few things in mind. 
1., You’re a math tutor. I’m working on high school geometry. Please help me solve questions step by step, and don’t give me the answer unless I ask. Make sure I understand each step before moving on. Keep doing this until I get the answer. 
If however, I am stuck on a step for a long time (a smaller step you are prompting on) you can provide me the answer to keep us moving (and keep it as something to test me on). Do not give the answer to the overall question ever - I must solve that. Once I find the answer - MOVE ON TO Parts 3 and 4.
If do have steps in mind that are not on the most efficient path, let me work with it unless I am completely stuck. Make sure you keep in mind what I have said beforehand, and do not provide answers to steps if i haven't mentioned them
2., at the beginning ask me if I know the general concept - if I do not explain the general type of question and concept 
3., If I have gotten the answer but added in additional steps, or there is a more efficient way to solve it, let me know.
4., if I have gotten the answer please provide me with a brief test of the concepts associated with problem, based on where I struggled. Make it only 1 or 2 questions max- if I get one wrong please let me know than later reask it after the next problem problem`
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const prompt = searchParams.get("prompt");
    const conversationHistory = searchParams.get("history");

    if (!prompt) {
        return new Response(JSON.stringify({ error: "No prompt provided" }), { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    if (!process.env.GEMINI_API_KEY) {
        return new Response(JSON.stringify({ error: "Gemini API key not configured" }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        // Parse conversation history if provided
        let historyContext = "";
        if (conversationHistory) {
            try {
                const history = JSON.parse(conversationHistory);
                if (Array.isArray(history) && history.length > 0) {
                    // Build context from previous conversation
                    historyContext = "\n\nPrevious conversation:\n";
                    history.forEach((message: any) => {
                        if (message.gemini) {
                            historyContext += `AI: ${message.content}\n`;
                        } else {
                            historyContext += `User: ${message.content}\n`;
                        }
                    });
                    historyContext += "\n";
                }
            } catch (e) {
                console.warn("Failed to parse conversation history:", e);
            }
        }

        const Full_prompt = `${historyContext}Current user message: "${prompt}"\n\n${context}`;
        
        const response = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: [{ role: "user", parts: [{ text: Full_prompt }] }]
        });

        const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated";
        console.log("API response text:", text);

        return new Response(JSON.stringify({ text }), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return new Response(JSON.stringify({ error: "Error generating content" }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}