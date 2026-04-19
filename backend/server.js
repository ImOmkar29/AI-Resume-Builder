// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import aiRoutes from "./routes/aiRoutes.js";
// 1️⃣ AI Resume Summary Generator - Plain Text + Unique + Debug
// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
// import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

console.log("🚀 AI Resume Builder Backend Started");
console.log("🔑 API Key Status:", process.env.OPENROUTER_API_KEY ? "✅ Loaded" : "❌ Missing");

// Comprehensive skill validation database
const VALID_SKILLS_DATABASE = {
  technical: [
    // Programming Languages
    "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "PHP", "Ruby", "Go", "Rust", "Swift", "Kotlin",
    "HTML", "CSS", "SQL", "NoSQL", "R", "MATLAB", "Shell", "Bash", "PowerShell",
    
    // Frontend Technologies
    "React", "Angular", "Vue.js", "Svelte", "Next.js", "Nuxt.js", "jQuery", "Bootstrap", "Tailwind CSS", "SASS", "LESS",
    "Webpack", "Vite", "Babel", "ES6", "Redux", "Context API", "Vuex", "RxJS",
    
    // Backend Technologies
    "Node.js", "Express.js", "Django", "Flask", "Spring Boot", "Laravel", "Ruby on Rails", "ASP.NET", "FastAPI",
    "REST APIs", "GraphQL", "SOAP", "Microservices", "Serverless", "WebSockets",
    
    // Databases
    "MySQL", "PostgreSQL", "MongoDB", "Redis", "Oracle", "SQL Server", "SQLite", "Cassandra", "DynamoDB", "Firebase",
    "Elasticsearch", "Neo4j", "MariaDB", "Cosmos DB",
    
    // Cloud & DevOps
    "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Terraform", "Ansible", "Jenkins", "GitLab CI", "GitHub Actions",
    "Linux", "Unix", "Windows Server", "Nginx", "Apache", "Load Balancing", "CI/CD", "Infrastructure as Code",
    
    // Mobile Development
    "React Native", "Flutter", "iOS Development", "Android Development", "Xamarin", "Ionic", "Cordova",
    
    // Data Science & AI
    "Machine Learning", "Deep Learning", "Natural Language Processing", "Computer Vision", "Data Analysis", "Data Visualization",
    "TensorFlow", "PyTorch", "Keras", "Scikit-learn", "Pandas", "NumPy", "Tableau", "Power BI", "Excel", "Statistics",
    
    // Testing
    "Jest", "Mocha", "Chai", "Cypress", "Selenium", "JUnit", "TestNG", "Pytest", "Enzyme", "React Testing Library",
    
    // Tools & Platforms
    "Git", "GitHub", "GitLab", "Bitbucket", "JIRA", "Confluence", "Slack", "Microsoft Teams", "Trello", "Asana",
    "Figma", "Adobe XD", "Sketch", "Photoshop", "Illustrator"
  ],
  
  soft: [
    "Communication", "Leadership", "Teamwork", "Problem Solving", "Critical Thinking", "Creativity", "Adaptability",
    "Time Management", "Project Management", "Agile Methodology", "Scrum", "Kanban", "Waterfall", "Risk Management",
    "Conflict Resolution", "Negotiation", "Presentation", "Public Speaking", "Emotional Intelligence", "Collaboration",
    "Decision Making", "Strategic Planning", "Analytical Thinking", "Attention to Detail", "Customer Service",
    "Mentoring", "Training", "Cross-functional Collaboration", "Stakeholder Management", "Budget Management",
    "Quality Assurance", "Process Improvement", "Innovation", "Research", "Documentation"
  ],
  
  business: [
    "Digital Marketing", "SEO", "SEM", "Social Media Marketing", "Content Marketing", "Email Marketing", "Analytics",
    "Sales", "Business Development", "Account Management", "Market Research", "Financial Analysis", "Budgeting",
    "Strategic Planning", "Product Management", "Supply Chain Management", "Logistics", "Operations Management",
    "Human Resources", "Recruitment", "Talent Management", "Performance Management", "Compensation & Benefits"
  ]
};

// Common invalid/nonsense words to reject
const INVALID_WORDS = [
  "hello", "test", "random", "something", "anything", "nothing", "word", "skill", "abc", "xyz", "qwerty",
  "asdf", "lorem", "ipsum", "dummy", "sample", "example", "demo", "temp", "temporary", "unknown", "n/a",
  "na", "tbd", "todo", "please", "add", "enter", "type", "click", "select", "choose", "option", "field",
  "input", "form", "data", "information", "details", "stuff", "things", "items", "objects", "elements"
];

// Function to validate if a skill is meaningful
function isValidSkill(skill) {
  if (!skill || typeof skill !== 'string') return false;
  
  const cleanSkill = skill.trim();
  const lowerSkill = cleanSkill.toLowerCase();
  
  // Basic validation
  if (cleanSkill.length < 2 || cleanSkill.length > 50) return false;
  if (/^\d+$/.test(cleanSkill)) return false; // Only numbers
  if (/[^a-zA-Z0-9\s\-\+\.\#]/.test(cleanSkill)) return false; // Invalid characters
  
  // Check against invalid words
  if (INVALID_WORDS.includes(lowerSkill)) return false;
  if (INVALID_WORDS.some(invalid => lowerSkill.includes(invalid))) return false;
  
  // Check if it's in our valid skills database (case insensitive)
  const allValidSkills = [
    ...VALID_SKILLS_DATABASE.technical,
    ...VALID_SKILLS_DATABASE.soft, 
    ...VALID_SKILLS_DATABASE.business
  ].map(s => s.toLowerCase());
  
  // Direct match
  if (allValidSkills.includes(lowerSkill)) return true;
  
  // Partial match (for variations)
  const hasValidPartialMatch = allValidSkills.some(validSkill => 
    lowerSkill.includes(validSkill) || validSkill.includes(lowerSkill)
  );
  
  if (hasValidPartialMatch) return true;
  
  // AI validation for edge cases
  return aiValidateSkill(cleanSkill);
}

// AI-based skill validation for edge cases
async function aiValidateSkill(skill) {
  try {
    const prompt = `
Is "${skill}" a valid, professional skill that would be appropriate for a resume? 
Consider if it's:
1. A real technical skill, soft skill, or professional competency
2. Something employers would recognize and value
3. Not generic, vague, or nonsensical

Respond with ONLY "valid" or "invalid" - no explanations.
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
        temperature: 0.1,
        max_tokens: 10
      })
    });

    const data = await response.json();
    const validation = data.choices?.[0]?.message?.content?.trim().toLowerCase();
    
    return validation === "valid";
    
  } catch (error) {
    console.error("AI Skill Validation Error:", error);
    // Fallback: use basic rules if AI fails
    return fallbackSkillValidation(skill);
  }
}

function fallbackSkillValidation(skill) {
  const lowerSkill = skill.toLowerCase();
  
  // Common skill patterns
  const validPatterns = [
    /^[a-z]+\s*\+\s*[a-z]+$/i, // Word+Word patterns
    /^[a-z\s]*development$/i, // Something Development
    /^[a-z\s]*management$/i, // Something Management
    /^[a-z\s]*analysis$/i, // Something Analysis
    /^[a-z\s]*engineering$/i, // Something Engineering
    /^[a-z\s]*programming$/i, // Something Programming
    /^[a-z\s]*design$/i, // Something Design
    /^[a-z\s]*security$/i, // Something Security
    /^[a-z\s]*testing$/i, // Something Testing
  ];
  
  return validPatterns.some(pattern => pattern.test(skill)) && 
         skill.length >= 3 && 
         skill.length <= 40;
}

// Test endpoint
app.get("/test", (req, res) => {
  res.json({
    message: "✅ Backend is working!",
    status: "AI Features Active",
    model: "OpenRouter GPT-4o-mini",
    skill_validation: "✅ Enhanced skill validation enabled",
    timestamp: new Date().toISOString()
  });
});

// 1️⃣ Enhanced AI Resume Summary Generator (ATS-Optimized with Uniqueness)
app.post("/generate-summary", async (req, res) => {
  try {
    const { name, title, skills = [], experience = "", jobDescription = "" } = req.body;
    if (!name || !title) return res.status(400).json({ error: "Name and title are required" });

    // Filter skills to only include valid ones
    const validSkills = skills.filter(skill => isValidSkill(skill));

    // Extract keywords from job description (improved method)
    const keywords = jobDescription
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !['with', 'that', 'this', 'have', 'will', 'been', 'your', 'from', 'they', 'would', 'there', 'could', 'other'].includes(word))
      .slice(0, 15);

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
Skills: ${validSkills.join(", ")}
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
        temperature: 1.1,
        max_tokens: 180,
        presence_penalty: 0.6,
        frequency_penalty: 0.8
      })
    });

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Invalid API response structure");
    }

    const summary = data.choices[0].message.content?.trim() ||
      `${selectedStyle} ${title} with expertise in ${validSkills.slice(0, 2).join(" and ")}. Proven track record in delivering results.`;

    res.json({ 
      summary,
      valid_skills_used: validSkills.length
    });

  } catch (err) {
    console.error("AI Summary Error:", err.message);
    res.status(500).json({ 
      error: "AI connection failed", 
      details: err.message,
      fallback_summary: `Professional ${req.body.title || 'specialist'} with strong background in technology and problem-solving.`
    });
  }
});

// 2️⃣ Enhanced AI Skills Suggestion with Validation
app.post("/suggest-skills", async (req, res) => {
  try {
    const { title, jobDescription = "" } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });

    // Extract skills from job description if available
    let jobSkills = [];
    if (jobDescription) {
      const skillKeywords = jobDescription.toLowerCase()
        .match(/\b(javascript|python|react|node\.?js|java|sql|aws|docker|kubernetes|typescript|html|css|mongodb|postgresql|mysql|git|jenkins|agile|scrum|rest|api|machine learning|ml|ai|data analysis|tableau|power bi|excel|word|powerpoint|communication|leadership|teamwork|problem solving|project management)\b/g) || [];
      
      jobSkills = [...new Set(skillKeywords)].map(skill => 
        skill.charAt(0).toUpperCase() + skill.slice(1)
      ).filter(skill => isValidSkill(skill));
    }

    const prompt = `Based on the job title "${title}" ${
      jobDescription ? `and job description keywords: ${jobSkills.join(", ")}` : ""
    }, suggest 8-12 key technical and soft skills that are most relevant and in-demand for this role. 
    Include a mix of hard skills (technical) and soft skills. Format as comma-separated values.
    
    IMPORTANT: Only suggest real, professional skills that would be appropriate for a resume.`;

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
    
    // Parse skills from response and validate them
    const aiSkills = skillsText.split(/[,•\n]/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && isValidSkill(s));
    
    // Combine and deduplicate skills, prioritizing job description skills
    const allSkills = [...new Set([...jobSkills, ...aiSkills])].slice(0, 12);

    res.json({ 
      skills: allSkills,
      source: jobDescription ? "AI + Job Description Analysis" : "AI Suggestion",
      validated: true
    });

  } catch (err) {
    console.error("Skills Suggestion Error:", err.message);
    
    // Enhanced fallback skills with validation
    const fallbackSkills = {
      "software": ["JavaScript", "Python", "React", "Node.js", "Git", "SQL", "Problem Solving"],
      "developer": ["HTML", "CSS", "JavaScript", "React", "Git", "REST APIs", "Communication"],
      "engineer": ["Problem Solving", "System Design", "Testing", "Debugging", "Agile", "CI/CD"],
      "web": ["HTML5", "CSS3", "JavaScript", "React", "Responsive Design", "Web Performance"],
      "frontend": ["React", "JavaScript", "TypeScript", "CSS", "HTML", "UI/UX"],
      "backend": ["Node.js", "Python", "SQL", "MongoDB", "API Design", "System Architecture"],
      "fullstack": ["React", "Node.js", "JavaScript", "SQL", "REST APIs", "Git"],
      "data": ["Python", "SQL", "Data Analysis", "Machine Learning", "Statistics", "Visualization"],
      "analyst": ["SQL", "Excel", "Data Analysis", "Reporting", "Statistics", "Business Intelligence"],
      "manager": ["Leadership", "Project Management", "Team Building", "Strategic Planning", "Communication"]
    };
    
    const lowerTitle = title.toLowerCase();
    let skills = ["Communication", "Problem Solving", "Teamwork"];
    
    for (const [keyword, keywordSkills] of Object.entries(fallbackSkills)) {
      if (lowerTitle.includes(keyword)) {
        skills = [...skills, ...keywordSkills];
        break;
      }
    }
    
    // Validate fallback skills
    const validatedSkills = [...new Set(skills)].filter(skill => isValidSkill(skill)).slice(0, 10);
    
    res.json({ 
      skills: validatedSkills,
      source: "Fallback System",
      validated: true,
      note: "AI service unavailable - using intelligent fallback"
    });
  }
});

// 3️⃣ Skill Validation Endpoint (for frontend to use)
app.post("/validate-skill", async (req, res) => {
  try {
    const { skill } = req.body;
    
    if (!skill || typeof skill !== 'string') {
      return res.json({ 
        valid: false, 
        message: "Skill cannot be empty" 
      });
    }

    const cleanSkill = skill.trim();
    
    if (cleanSkill.length < 2) {
      return res.json({ 
        valid: false, 
        message: "Skill must be at least 2 characters long" 
      });
    }

    if (cleanSkill.length > 50) {
      return res.json({ 
        valid: false, 
        message: "Skill must be less than 50 characters" 
      });
    }

    // Basic character validation
    if (/[^a-zA-Z0-9\s\-\+\.\#]/.test(cleanSkill)) {
      return res.json({ 
        valid: false, 
        message: "Skill contains invalid characters" 
      });
    }

    // Check against invalid words
    const lowerSkill = cleanSkill.toLowerCase();
    if (INVALID_WORDS.includes(lowerSkill)) {
      return res.json({ 
        valid: false, 
        message: "Please enter a meaningful professional skill" 
      });
    }

    // Validate using our system
    const isValid = await isValidSkill(cleanSkill);
    
    if (isValid) {
      return res.json({ 
        valid: true, 
        message: "Valid professional skill",
        skill: cleanSkill
      });
    } else {
      return res.json({ 
        valid: false, 
        message: "This doesn't appear to be a valid professional skill. Please enter a real technical or soft skill.",
        suggestions: getSkillSuggestions(cleanSkill)
      });
    }

  } catch (error) {
    console.error("Skill Validation Error:", error);
    res.json({ 
      valid: false, 
      message: "Validation service unavailable. Please try a different skill." 
    });
  }
});

// Helper function to suggest similar valid skills
function getSkillSuggestions(invalidSkill) {
  const lowerInvalid = invalidSkill.toLowerCase();
  const allSkills = [
    ...VALID_SKILLS_DATABASE.technical,
    ...VALID_SKILLS_DATABASE.soft,
    ...VALID_SKILLS_DATABASE.business
  ];
  
  // Find similar skills
  const suggestions = allSkills.filter(validSkill => 
    validSkill.toLowerCase().includes(lowerInvalid) || 
    lowerInvalid.includes(validSkill.toLowerCase()) ||
    validSkill.toLowerCase().split(' ').some(word => lowerInvalid.includes(word))
  ).slice(0, 5);
  
  return suggestions.length > 0 ? suggestions : ["JavaScript", "Python", "Communication", "Problem Solving", "Project Management"];
}

// 4️⃣ Enhanced ATS Score Calculator that includes Skills validation
app.post("/ats-score", async (req, res) => {
  try {
    const { summary, jobDescription, skills = [] } = req.body;
    
    if (!summary || !jobDescription) {
      return res.status(400).json({ 
        error: "Both 'summary' and 'jobDescription' are required" 
      });
    }

    // Filter and validate skills before processing
    const validSkills = Array.isArray(skills) ? skills.filter(skill => isValidSkill(skill)) : [];

    const prompt = `
You are an ATS (Applicant Tracking System) expert. Analyze this resume content against the job description and provide a detailed scoring breakdown.

JOB DESCRIPTION:
${jobDescription}

RESUME CONTENT TO ANALYZE:
- SUMMARY: ${summary}
- VALIDATED SKILLS: ${validSkills.join(', ')}

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
  "keyword_analysis": {
    "summary_keywords_found": [number],
    "skills_keywords_found": [number],
    "total_keywords_found": [number],
    "coverage_percentage": [number],
    "valid_skills_count": ${validSkills.length}
  },
  "recommendation": "One paragraph recommendation to improve the resume for better ATS compatibility."
}

SCORING CRITERIA:
- keyword_match (0-40): How many important job keywords appear in BOTH summary and skills
- relevance (0-30): How well the entire resume aligns with job requirements  
- clarity (0-20): How clear, readable and professional the summary is
- ats_friendliness (0-10): Proper formatting, no special characters, appropriate length

IMPORTANT: 
- Consider both summary AND validated skills for keyword matching
- Skills section is particularly important for technical keyword matching
- Missing keywords should only include terms that are NOT found in ANY resume section
- Return ONLY valid JSON, no markdown, no explanations, no extra text.
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
        temperature: 0.3,
        max_tokens: 1000
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

    // Clean the response
    aiResponse = aiResponse.replace(/```json\s*/, '').replace(/```\s*$/, '').trim();
    
    let parsedResult;
    try {
      parsedResult = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      parsedResult = calculateEnhancedATSScore(summary, jobDescription, validSkills);
    }

    // Add skill validation info
    parsedResult.skill_validation = {
      total_skills_provided: Array.isArray(skills) ? skills.length : 0,
      valid_skills_count: validSkills.length,
      validation_enabled: true
    };

    res.json(parsedResult);

  } catch (err) {
    console.error("ATS Score Error:", err.message);
    
    const validSkills = Array.isArray(req.body.skills) ? req.body.skills.filter(skill => isValidSkill(skill)) : [];
    const fallbackResult = calculateEnhancedATSScore(
      req.body.summary || "", 
      req.body.jobDescription || "", 
      validSkills
    );
    
    fallbackResult.skill_validation = {
      total_skills_provided: Array.isArray(req.body.skills) ? req.body.skills.length : 0,
      valid_skills_count: validSkills.length,
      validation_enabled: true
    };
    
    res.status(500).json({ 
      error: "Failed to calculate ATS score",
      details: err.message,
      ...fallbackResult
    });
  }
});

// Enhanced fallback ATS scoring
function calculateEnhancedATSScore(summary, jobDescription, skills = []) {
  const summaryWords = summary.toLowerCase().split(/\W+/);
  const skillsWords = skills.map(skill => skill.toLowerCase().replace(/[^\w]/g, ''));
  const allResumeWords = [...summaryWords, ...skillsWords].filter(word => word.length > 2);
  const jobWords = jobDescription.toLowerCase().split(/\W+/).filter(word => word.length > 3);
  
  const commonWords = jobWords.filter(jobWord => 
    allResumeWords.some(resumeWord => resumeWord.includes(jobWord) || jobWord.includes(resumeWord))
  );
  
  const keywordMatchRatio = commonWords.length / Math.max(jobWords.length, 1);
  const keywordScore = Math.min(40, keywordMatchRatio * 40);
  const relevanceScore = Math.min(30, keywordScore * 0.75);
  const clarityScore = Math.min(20, summary.length > 50 && summary.length < 300 ? 18 : 10);
  const atsScore = Math.min(10, summary.match(/^[a-zA-Z0-9\s.,;:()\-]+$/) ? 9 : 6);
  
  const missingKeywords = jobWords.filter(jobWord => 
    !allResumeWords.some(resumeWord => resumeWord.includes(jobWord) || jobWord.includes(resumeWord))
  ).slice(0, 8);
  
  const summaryKeywordsFound = jobWords.filter(jobWord => 
    summaryWords.some(summaryWord => summaryWord.includes(jobWord))
  ).length;
  
  const skillsKeywordsFound = jobWords.filter(jobWord => 
    skillsWords.some(skillWord => skillWord.includes(jobWord))
  ).length;

  return {
    total_score: Math.round(keywordScore + relevanceScore + clarityScore + atsScore),
    breakdown: {
      keyword_match: Math.round(keywordScore),
      relevance: Math.round(relevanceScore),
      clarity: Math.round(clarityScore),
      ats_friendliness: Math.round(atsScore)
    },
    missing_keywords: missingKeywords,
    keyword_analysis: {
      summary_keywords_found: summaryKeywordsFound,
      skills_keywords_found: skillsKeywordsFound,
      total_keywords_found: commonWords.length,
      coverage_percentage: Math.round((commonWords.length / Math.max(jobWords.length, 1)) * 100),
      valid_skills_count: skills.length
    },
    recommendation: `Your resume covers ${Math.round((commonWords.length / Math.max(jobWords.length, 1)) * 100)}% of job keywords. ${skills.length > 0 ? 'Your skills section is strong for ATS scanning.' : 'Consider adding more technical skills to improve keyword matching.'}`
  };
}

// 5️⃣ Get popular skills by category
app.get("/popular-skills", (req, res) => {
  res.json({
    technical: VALID_SKILLS_DATABASE.technical.slice(0, 30),
    soft: VALID_SKILLS_DATABASE.soft.slice(0, 20),
    business: VALID_SKILLS_DATABASE.business.slice(0, 15),
    total_skills: VALID_SKILLS_DATABASE.technical.length + VALID_SKILLS_DATABASE.soft.length + VALID_SKILLS_DATABASE.business.length
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🎯 Server running on port ${PORT}`);
  console.log(`🌟 AI Features: ACTIVE (OpenRouter GPT-4o-mini)`);
  console.log(`🔗 Ready for frontend: http://localhost:${PORT}`);
  console.log(`📊 ATS Scoring: Enhanced with skills validation`);
  console.log(`🎨 Summary Generation: Unique outputs every time`);
  console.log(`🛡️ Skill Validation: ${Object.values(VALID_SKILLS_DATABASE).flat().length} validated skills`);
  console.log(`💡 New Endpoints: /validate-skill, /popular-skills`);
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