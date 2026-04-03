import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getAllProducts } from "@/lib/database/actions/product.actions";
import { connectToDatabase } from "@/lib/database/connect";

const getGeminiApiKeys = () => {
  return [
    process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    process.env.NEXT_PUBLIC_GEMINI_API_KEY_2,
    process.env.NEXT_PUBLIC_GEMINI_API_KEY_3,
    process.env.NEXT_PUBLIC_GEMINI_API_KEY_4,
    process.env.NEXT_PUBLIC_GEMINI_API_KEY_5,
    process.env.NEXT_PUBLIC_GEMINI_API_KEY_6,
    process.env.NEXT_PUBLIC_GEMINI_API_KEY_7,
  ].filter(Boolean) as string[];
};

// Cache products data (refresh every 5 minutes)
let cachedProducts: any[] = [];
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function getProductsData() {
  const now = Date.now();

  if (cachedProducts.length > 0 && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedProducts;
  }

  try {
    await connectToDatabase();
    const result = await getAllProducts();

    if (result.success && result.products) {
      const productsData = result.products.map((product: any) => ({
        id: product._id,
        name: product.name,
        brand: product.brand || "",
        description: product.description || "",
        price: product.price,
        discount: product.discount || 0,
        category: product.category?.name || "",
        inStock: product.inStock !== false,
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
    const apiKeys = getGeminiApiKeys();

    if (apiKeys.length === 0) {
      return NextResponse.json(
        { success: false, message: "AI service API keys are missing." },
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

    const products = await getProductsData();
    const selectedProducts = products.slice(0, 50);

    const productKnowledge = products.length > 0
      ? `\n\nPRODUCT CATALOG (showing ${selectedProducts.length} products):\n${JSON.stringify(selectedProducts, null, 2)}\n\nNote: Total products: ${products.length}.`
      : "\n\nNote: No products available.";

    const systemPrompt = `You are a helpful AI shopping assistant for an e-commerce website. Help customers find products and answer queries.
    
    GUIDELINES:
    1. Use the provided product catalog for accuracy.
    2. ALWAYS include product links for each product mentioned using markdown: [Product Name](/product/slug)
    3. The URL part MUST be exactly "/product/" followed by the "slug" field from the catalog.
    4. Suggest product names and prices (₹ prefix).
    5. Be friendly and concise.
    6. If product not found, suggest searching our catalog.
    
    ${productKnowledge}`;

    // Format chat history for @google/genai
    const contents = conversationHistory.slice(-6).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // Add current context and message
    contents.push({
      role: "user",
      parts: [{ text: `${systemPrompt}\n\nCustomer: ${message}` }]
    });

    // Strategy: Try keys in random order until one works
    const shuffledKeys = [...apiKeys].sort(() => Math.random() - 0.5);
    let lastError: any = null;
    let aiResponse = "";

    for (const key of shuffledKeys) {
      try {
        const ai = new GoogleGenAI({ apiKey: key });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: contents,
        });

        if (response.text) {
          aiResponse = response.text;
          break; // Success!
        }
      } catch (err: any) {
        console.error(`Gemini API Key failed: ${key.substring(0, 8)}...`, err.message);
        lastError = err;
        // Continue to next key
      }
    }

    if (!aiResponse) {
      throw lastError || new Error("Failed to generate response after trying all API keys.");
    }


    return NextResponse.json({
      success: true,
      message: aiResponse,
    });
  } catch (error: any) {
    console.error("Chatbot API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "An error occurred.",
      },
      { status: 500 }
    );
  }
}
