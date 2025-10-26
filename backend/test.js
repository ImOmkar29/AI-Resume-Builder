import dotenv from "dotenv";
dotenv.config();

console.log("Testing environment variables...");
console.log("API Key exists:", !!process.env.OPENAI_API_KEY);
console.log("PORT:", process.env.PORT);

