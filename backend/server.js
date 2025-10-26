// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import aiRoutes from "./routes/aiRoutes.js";
// 1️⃣ AI Resume Summary Generator - Plain Text + Unique + Debug
// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

console.log("🚀 AI Resume Builder Backend Started");
console.log("🔑 API Key Status:", process.env.OPENROUTER_API_KEY ? "✅ Loaded" : "❌ Missing");

// Test endpoint
app.get("/test", (req, res) => {
  res.json({
    message: "✅ Backend is working!",
    status: "AI Features Active",
    model: "OpenRouter GPT-4o-mini",
    timestamp: new Date().toISOString()
  });
});

// 1️⃣ Enhanced AI Resume Summary Generator (ATS-Optimized with Uniqueness)
app.post("/generate-summary", async (req, res) => {
  try {
    const { name, title, skills = [], experience = "", jobDescription = "" } = req.body;
    if (!name || !title) return res.status(400).json({ error: "Name and title are required" });

    // Extract keywords from job description (improved method)
    const keywords = jobDescription
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !['with', 'that', 'this', 'have', 'will', 'been', 'your', 'from', 'they', 'would', 'there', 'could', 'other'].includes(word))
      .slice(0, 15); // limit to most relevant keywords

    // Generate a unique timestamp-based seed for variety
    const uniqueSeed = Date.now() % 1000;
    const summaryStyles = [
      "results-driven professional",
      "dynamic and experienced",
      "skilled professional",
      "accomplished specialist",
      "dedicated expert",
      "innovative professional"
    ];
    const selectedStyle = summaryStyles[uniqueSeed % summaryStyles.length];

    const prompt = `
Create a UNIQUE and professional ATS-optimized resume summary for:
Name: ${name}
Title: ${title}
Skills: ${skills.join(", ")}
Experience: ${experience}
Job Keywords to Include: ${[...new Set(keywords)].join(", ")}
Style Direction: ${selectedStyle}
Unique Seed: ${uniqueSeed}

CRITICAL REQUIREMENTS:
1. Write EXACTLY 3-4 short, punchy sentences (max 80 words total)
2. First sentence: Strong opener with title and key strength
3. Second sentence: Include 2-3 job keywords naturally
4. Third sentence: Highlight a specific skill or achievement  
5. Optional fourth sentence: Call to action or value proposition
6. Keep sentences under 20 words each
7. Make it ATS-friendly with simple, clear language
8. NO fluff words, be direct and impactful
9. Ensure each generation is distinctly different

Generate a concise, keyword-rich summary that's easy to scan.
`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 1.1, // Balanced creativity for concise outputs
        max_tokens: 180, // Reduced for shorter summaries
        presence_penalty: 0.6, // Discourage repetitive content
        frequency_penalty: 0.8 // Encourage varied word usage
      })
    });

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Invalid API response structure");
    }

    const summary = data.choices[0].message.content?.trim() ||
      `${selectedStyle} ${title} with expertise in ${skills.slice(0, 2).join(" and ")}. Proven track record in delivering results.`;

    res.json({ summary });

  } catch (err) {
    console.error("AI Summary Error:", err.message);
    res.status(500).json({ 
      error: "AI connection failed", 
      details: err.message,
      fallback_summary: `Professional ${req.body.title || 'specialist'} with strong background in technology and problem-solving.`
    });
  }
});

// 2️⃣ AI Skills Suggestion
app.post("/suggest-skills", async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });

    const prompt = `List 8-12 key technical and soft skills for a ${title}, comma-separated. Focus on current industry standards.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 150
      })
    });

    const data = await response.json();
    const skillsText = data.choices?.[0]?.message?.content || "";
    const skills = skillsText.split(/[,•\n]/).map(s => s.trim()).filter(s => s.length > 0);

    res.json({ skills: skills.slice(0, 12) });

  } catch (err) {
    console.error("Skills Suggestion Error:", err.message);
    res.status(500).json({ error: "AI connection failed" });
  }
});

// 3️⃣ Advanced ATS Score Calculator with Detailed Breakdown
app.post("/ats-score", async (req, res) => {
  try {
    const { summary, jobDescription } = req.body;
    
    if (!summary || !jobDescription) {
      return res.status(400).json({ 
        error: "Both 'summary' and 'jobDescription' are required" 
      });
    }

    const prompt = `
You are an ATS (Applicant Tracking System) expert. Analyze this resume summary against the job description and provide a detailed scoring breakdown.

JOB DESCRIPTION:
${jobDescription}

RESUME SUMMARY:
${summary}

PROVIDE YOUR RESPONSE IN THIS EXACT JSON FORMAT (no additional text):
{
  "total_score": [number 0-100],
  "breakdown": {
    "keyword_match": [number 0-40],
    "relevance": [number 0-30], 
    "clarity": [number 0-20],
    "ats_friendliness": [number 0-10]
  },
  "missing_keywords": [
    "keyword1",
    "keyword2"
  ],
  "recommendation": "One paragraph recommendation to improve the resume summary for better ATS compatibility."
}

SCORING CRITERIA:
- keyword_match (0-40): How many important job keywords appear in the summary
- relevance (0-30): How well the summary aligns with job requirements  
- clarity (0-20): How clear, readable and professional the summary is
- ats_friendliness (0-10): Proper formatting, no special characters, appropriate length

IMPORTANT: Return ONLY valid JSON, no markdown, no explanations, no extra text.
`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3, // Lower temperature for consistent scoring
        max_tokens: 800
      })
    });

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Invalid API response structure");
    }

    let aiResponse = data.choices[0].message.content?.trim();
    
    if (!aiResponse) {
      throw new Error("Empty AI response");
    }

    // Clean the response to ensure it's valid JSON
    aiResponse = aiResponse.replace(/```json\s*/, '').replace(/```\s*$/, '').trim();
    
    let parsedResult;
    try {
      parsedResult = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("AI Response:", aiResponse);
      
      // Fallback scoring logic
      const summaryWords = summary.toLowerCase().split(/\W+/);
      const jobWords = jobDescription.toLowerCase().split(/\W+/);
      const commonWords = summaryWords.filter(word => 
        jobWords.includes(word) && word.length > 3
      );
      
      const keywordScore = Math.min(40, (commonWords.length / Math.max(jobWords.filter(w => w.length > 3).length * 0.3, 1)) * 40);
      const relevanceScore = Math.min(30, keywordScore * 0.75);
      const clarityScore = Math.min(20, summary.length > 50 && summary.length < 300 ? 18 : 10);
      const atsScore = Math.min(10, summary.match(/^[a-zA-Z0-9\s.,;:()\-]+$/) ? 9 : 6);
      
      parsedResult = {
        total_score: Math.round(keywordScore + relevanceScore + clarityScore + atsScore),
        breakdown: {
          keyword_match: Math.round(keywordScore),
          relevance: Math.round(relevanceScore),
          clarity: Math.round(clarityScore),
          ats_friendliness: Math.round(atsScore)
        },
        missing_keywords: jobWords.filter(word => 
          word.length > 3 && !summaryWords.includes(word)
        ).slice(0, 5),
        recommendation: "Consider adding more specific keywords from the job description to improve keyword matching. Focus on technical skills and qualifications mentioned in the job posting."
      };
    }

    // Validate the parsed result structure
    if (!parsedResult.total_score || !parsedResult.breakdown || !parsedResult.missing_keywords || !parsedResult.recommendation) {
      throw new Error("Invalid response structure from AI");
    }

    // Ensure scores are within valid ranges
    parsedResult.breakdown.keyword_match = Math.min(40, Math.max(0, parsedResult.breakdown.keyword_match));
    parsedResult.breakdown.relevance = Math.min(30, Math.max(0, parsedResult.breakdown.relevance));
    parsedResult.breakdown.clarity = Math.min(20, Math.max(0, parsedResult.breakdown.clarity));
    parsedResult.breakdown.ats_friendliness = Math.min(10, Math.max(0, parsedResult.breakdown.ats_friendliness));
    
    // Recalculate total score to ensure accuracy
    parsedResult.total_score = parsedResult.breakdown.keyword_match + 
                              parsedResult.breakdown.relevance + 
                              parsedResult.breakdown.clarity + 
                              parsedResult.breakdown.ats_friendliness;

    res.json(parsedResult);

  } catch (err) {
    console.error("ATS Score Error:", err.message);
    res.status(500).json({ 
      error: "Failed to calculate ATS score",
      details: err.message,
      fallback: {
        total_score: 65,
        breakdown: {
          keyword_match: 25,
          relevance: 20,
          clarity: 15,
          ats_friendliness: 5
        },
        missing_keywords: ["specific", "skills", "required"],
        recommendation: "Unable to process detailed analysis. Please try again or check your input."
      }
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🎯 Server running on port ${PORT}`);
  console.log(`🌟 AI Features: ACTIVE (OpenRouter GPT-4o-mini)`);
  console.log(`🔗 Ready for frontend: http://localhost:${PORT}`);
  console.log(`📊 ATS Scoring: Enhanced with detailed breakdown`);
  console.log(`🎨 Summary Generation: Unique outputs every time`);
});
// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";

// dotenv.config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// console.log("🚀 Resume Builder Backend Started");

// // Test endpoint
// app.get("/test", (req, res) => {
//   res.json({ 
//     message: "✅ Backend is working!",
//     status: "Gemini API: Fallback Mode (No API Key Needed)",
//     timestamp: new Date().toISOString()
//   });
// });

// // 1️⃣ AI Resume Summary Generator (Fallback - No API Needed)
// app.post("/generate-summary", async (req, res) => {
//   try {
//     const { name = "Candidate", title = "Professional", skills = [] } = req.body;
    
//     const skillText = skills.length > 0 ? `Proficient in ${skills.slice(0, 3).join(", ")}` : "skilled professional";
    
//     const summaries = [
//       `Results-driven ${title} with expertise in ${skillText}. Proven track record of delivering successful outcomes through strategic planning and effective execution. Strong communicator and collaborative team player committed to excellence.`,
      
//       `Experienced ${title} specializing in ${skillText}. Demonstrated ability to solve complex problems and drive innovation. Excellent analytical skills combined with a passion for continuous improvement and professional growth.`,
      
//       `Dynamic ${title} with strong background in ${skillText}. Adept at managing multiple priorities while maintaining high quality standards. Committed to achieving organizational goals through dedication and expertise.`
//     ];
    
//     const randomSummary = summaries[Math.floor(Math.random() * summaries.length)];
    
//     res.json({ 
//       summary: randomSummary,
//       note: "Generated using fallback AI (No API key needed)"
//     });
    
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ error: "Failed to generate summary" });
//   }
// });

// // 2️⃣ AI Skills Suggestion (Fallback)
// app.post("/suggest-skills", async (req, res) => {
//   try {
//     const { title = "professional" } = req.body;
    
//     // Skill database based on job titles
//     const skillDatabase = {
//       "software": ["JavaScript", "Python", "React", "Node.js", "Git", "SQL", "TypeScript", "AWS"],
//       "developer": ["HTML", "CSS", "JavaScript", "React", "Git", "REST APIs", "MongoDB", "Express.js"],
//       "engineer": ["Problem Solving", "System Design", "Testing", "Debugging", "Agile", "CI/CD", "Documentation"],
//       "web": ["HTML5", "CSS3", "JavaScript", "React", "Vue.js", "Responsive Design", "Web Performance"],
//       "frontend": ["React", "Vue.js", "Angular", "TypeScript", "SASS", "Webpack", "Jest", "UI/UX"],
//       "backend": ["Node.js", "Python", "Java", "SQL", "MongoDB", "Redis", "Docker", "API Design"],
//       "fullstack": ["React", "Node.js", "MongoDB", "Express", "REST APIs", "Git", "AWS", "Agile"],
//       "data": ["Python", "SQL", "Pandas", "Machine Learning", "Data Analysis", "Statistics", "Visualization"],
//       "analyst": ["SQL", "Excel", "Tableau", "Data Analysis", "Reporting", "Statistics", "Business Intelligence"],
//       "manager": ["Leadership", "Project Management", "Agile", "Budgeting", "Team Building", "Strategic Planning"],
//       "designer": ["UI/UX", "Figma", "Adobe Creative Suite", "Wireframing", "Prototyping", "User Research"]
//     };
    
//     let skills = ["Communication", "Problem Solving", "Teamwork", "Time Management"];
//     const lowerTitle = title.toLowerCase();
    
//     // Find matching skills
//     for (const [keyword, keywordSkills] of Object.entries(skillDatabase)) {
//       if (lowerTitle.includes(keyword)) {
//         skills = [...skills, ...keywordSkills];
//         break;
//       }
//     }
    
//     // Add some random relevant skills
//     const allSkills = [
//       "Communication", "Problem Solving", "Teamwork", "Leadership", "Adaptability",
//       "Time Management", "Critical Thinking", "Creativity", "Collaboration", "Analytical Skills"
//     ];
    
//     skills = [...new Set([...skills, ...allSkills])].slice(0, 10);
    
//     res.json({ 
//       skills,
//       note: "Suggested using intelligent fallback system"
//     });
    
//   } catch (error) {
//     console.error("Error:", error);
//     res.json({ skills: ["Communication", "Problem Solving", "Teamwork", "Adaptability"] });
//   }
// });

// // 3️⃣ AI Resume Improver (Fallback)
// app.post("/improve-section", async (req, res) => {
//   try {
//     const { sectionName, content } = req.body;
    
//     if (!content || content.trim().length < 10) {
//       return res.json({ improvedText: content });
//     }
    
//     // Simple text improvement logic
//     let improvedText = content
//       .replace(/\bI\b/g, "Demonstrated") // Make it more professional
//       .replace(/\bmy\b/g, "proven")
//       .replace(/\bme\b/g, "this professional")
//       .replace(/\.\s*/g, ". ") // Fix spacing
//       .replace(/\s+/g, ' ') // Remove extra spaces
//       .trim();
    
//     // Capitalize first letter
//     improvedText = improvedText.charAt(0).toUpperCase() + improvedText.slice(1);
    
//     // Ensure it ends with a period
//     if (!improvedText.endsWith('.')) {
//       improvedText += '.';
//     }
    
//     res.json({ 
//       improvedText,
//       note: "Enhanced using AI-style text processing"
//     });
    
//   } catch (error) {
//     console.error("Error:", error);
//     res.json({ improvedText: req.body.content });
//   }
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🎯 Server running on port ${PORT}`);
//   console.log(`💡 Mode: Fallback AI (No external API needed)`);
//   console.log(`🔗 Test: http://localhost:${PORT}/test`);
// });