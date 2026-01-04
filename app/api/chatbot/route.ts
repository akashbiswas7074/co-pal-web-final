import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAllProducts } from "@/lib/database/actions/product.actions";
import { connectToDatabase } from "@/lib/database/connect";

// Get Gemini API keys from environment
// Note: These use NEXT_PUBLIC_ prefix as configured in .env
// For production, consider using non-prefixed variables (GEMINI_API_KEY) for better security
const geminiApiKeys = [
  process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  process.env.NEXT_PUBLIC_GEMINI_API_KEY_2,
  process.env.NEXT_PUBLIC_GEMINI_API_KEY_3,
  process.env.NEXT_PUBLIC_GEMINI_API_KEY_4,
  process.env.NEXT_PUBLIC_GEMINI_API_KEY_5,
].filter(Boolean) as string[];

// Initialize Gemini client with fallback support
const getGeminiClient = (keyIndex: number = 0) => {
  if (keyIndex >= geminiApiKeys.length) {
    throw new Error("No Gemini API key configured or all keys exhausted");
  }
  const apiKey = geminiApiKeys[keyIndex];
  if (!apiKey) {
    throw new Error("No Gemini API key configured");
  }
  return new GoogleGenerativeAI(apiKey);
};

// Cache products data (refresh every 5 minutes)
let cachedProducts: any[] = [];
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function getProductsData() {
  const now = Date.now();
  
  // Return cached data if still valid
  if (cachedProducts.length > 0 && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedProducts;
  }

  try {
    await connectToDatabase();
    const result = await getAllProducts();
    
    if (result.success && result.products) {
      // Extract relevant product information for the AI
      const productsData = result.products.map((product: any) => ({
        id: product._id,
        name: product.name,
        description: product.description || "",
        price: product.price,
        originalPrice: product.originalPrice || product.price,
        discount: product.discount || 0,
        category: product.category?.name || "",
        subCategories: product.subCategories?.map((sub: any) => sub.name).join(", ") || "",
        tags: product.tagValues?.map((tag: any) => tag.tag?.name).filter(Boolean).join(", ") || "",
        inStock: product.inStock !== false,
        featured: product.isFeatured || false,
        slug: product.slug || "",
      }));

      cachedProducts = productsData;
      cacheTimestamp = now;
      return productsData;
    }
  } catch (error) {
    console.error("Error fetching products for chatbot:", error);
  }

  return cachedProducts.length > 0 ? cachedProducts : [];
}

export async function POST(request: NextRequest) {
  try {
    // Check if Gemini API key is configured
    if (geminiApiKeys.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "AI service is not configured. Please set NEXT_PUBLIC_GEMINI_API_KEY in environment variables.",
        },
        { status: 500 }
      );
    }

    const { message, conversationHistory = [] } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { success: false, message: "Message is required" },
        { status: 400 }
      );
    }

    // Get all products data
    const products = await getProductsData();

    // Create a comprehensive product knowledge base (limit to 50 products to avoid token limits)
    // Focus on featured products first, then others
    const featuredProducts = products.filter((p: any) => p.featured).slice(0, 20);
    const otherProducts = products.filter((p: any) => !p.featured).slice(0, 30);
    const selectedProducts = [...featuredProducts, ...otherProducts];
    
    const productKnowledge = products.length > 0
      ? `\n\nPRODUCT CATALOG (showing ${selectedProducts.length} of ${products.length} products):\n${JSON.stringify(selectedProducts, null, 2)}\n\nNote: There are ${products.length} total products in the catalog. When asked about products, search through the catalog above. If a product is not in this list, mention that you can help them search for it.`
      : "\n\nNote: No products are currently available in the catalog.";

    // Build conversation context
    const conversationContext = conversationHistory
      .slice(-10) // Last 10 messages for context
      .map((msg: any) => `${msg.role}: ${msg.content}`)
      .join("\n");

    // Create system prompt
    const systemPrompt = `You are a helpful AI shopping assistant for an e-commerce website. Your role is to help customers find products, answer questions about products, provide recommendations, and assist with shopping-related queries.

IMPORTANT GUIDELINES:
1. You have access to the complete product catalog with details like name, description, price, category, tags, and availability.
2. When recommending products, mention specific product names, prices, and key features from the catalog.
3. If a customer asks about a product, provide accurate information from the catalog.
4. Help customers find products by category, price range, or features.
5. Be friendly, helpful, and concise in your responses.
6. If you don't have information about a specific product, say so honestly.
7. Always format prices in a clear way (e.g., "₹1,299" or "Rs. 1,299").
8. When mentioning products, you can suggest they visit the product page for more details.
9. Keep responses conversational and natural.
10. If asked about non-product topics, politely redirect to product-related questions.

${productKnowledge}

Previous conversation context:
${conversationContext || "This is the start of the conversation."}`;

    // Build conversation history for Gemini
    const chatHistory = conversationHistory.slice(-10).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // For Gemini, we need to include system instructions in the first message
    // Build the full prompt with system context
    let aiResponse: string = "";
    let lastError: any = null;
    
    // Try with fallback to other API keys if one fails
    // Also try multiple model names as fallback
    const modelNames = [
      "gemini-1.0-pro",
      "gemini-1.5-flash",
      "gemini-1.5-pro",
      "gemini-pro",
    ];

    for (let keyIndex = 0; keyIndex < geminiApiKeys.length; keyIndex++) {
      let keySuccess = false;
      
      for (const modelName of modelNames) {
        try {
          const genAI = getGeminiClient(keyIndex);
          const model = genAI.getGenerativeModel({ 
            model: modelName,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 500,
            },
          });

          if (chatHistory.length > 0) {
            // Use chat with history - prepend system instructions to history
            const historyWithSystem = [
              {
                role: "user" as const,
                parts: [{ text: systemPrompt }],
              },
              {
                role: "model" as const,
                parts: [{ text: "I understand. I'm ready to help customers with product questions, recommendations, and shopping assistance." }],
              },
              ...chatHistory,
            ];
            
            const chat = model.startChat({
              history: historyWithSystem,
            });
            const result = await chat.sendMessage(message);
            const response = await result.response;
            aiResponse = response.text() || "I apologize, but I couldn't generate a response. Please try again.";
          } else {
            // First message - include system prompt
            const fullPrompt = `${systemPrompt}\n\nUser: ${message}`;
            const result = await model.generateContent(fullPrompt);
            const response = await result.response;
            aiResponse = response.text() || "I apologize, but I couldn't generate a response. Please try again.";
          }
          
          // Success - mark key as successful and break out of model loop
          keySuccess = true;
          break;
        } catch (error: any) {
          lastError = error;
          const errorMessage = error.message || String(error);
          
          // Skip suspended keys - try next key (not next model)
          if (errorMessage.includes("suspended") || errorMessage.includes("CONSUMER_SUSPENDED")) {
            console.warn(`Gemini API key ${keyIndex + 1} is suspended, trying next key...`);
            break; // Break out of model loop, try next key
          }
          
          // If model not found, try next model name
          if (errorMessage.includes("404") || errorMessage.includes("not found")) {
            console.warn(`Gemini API key ${keyIndex + 1} - model "${modelName}" not found, trying next model...`);
            continue; // Try next model name
          }
          
          // Other errors - log and try next model
          console.error(`Gemini API key ${keyIndex + 1} with model "${modelName}" failed:`, errorMessage);
          continue; // Try next model
        }
      }
      
      // If we got a response, break out of key loop
      if (keySuccess && aiResponse) break;
    }
    
    if (!aiResponse) {
      throw lastError || new Error("Failed to get response from AI service");
    }

    return NextResponse.json({
      success: true,
      message: aiResponse,
    });
  } catch (error: any) {
    console.error("Chatbot API error:", error);

    // Handle specific Gemini API errors
    if (error.message?.includes("API_KEY") || error.message?.includes("authentication")) {
      return NextResponse.json(
        {
          success: false,
          message: "AI service authentication failed. Please check Gemini API key configuration.",
        },
        { status: 500 }
      );
    }

    if (error.message?.includes("quota") || error.message?.includes("rate limit")) {
      return NextResponse.json(
        {
          success: false,
          message: "AI service is currently rate-limited. Please try again in a moment.",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error.message || "An error occurred while processing your request.",
      },
      { status: 500 }
    );
  }
}
