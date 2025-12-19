const OpenAI = require('openai');
const { getEnvConfig } = require('../config/env');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: getEnvConfig().OPENAI_API_KEY,
  timeout: 30000, // 30 second timeout
});

// System prompts for different tutoring scenarios
const SYSTEM_PROMPTS = {
  generalTutor: `You are TutorUG, an AI-powered mathematics tutor designed specifically for Ugandan O-Level students. Your goal is to help students excel in their UNEB examinations through personalized, contextual learning.

CORE PRINCIPLES:
1. Use Ugandan context and examples (Kampala, boda bodas, local markets, schools)
2. Explain concepts step-by-step with patience
3. Adapt to student's learning pace and current class level
4. Use simple, clear English with some Luganda phrases when appropriate
5. Focus on UNEB syllabus and examination techniques
6. Encourage critical thinking and problem-solving skills
7. Be encouraging and supportive, never discouraging

RESPONSE FORMAT:
- Start with acknowledgment of student's question
- Explain concept with Ugandan examples
- Provide step-by-step solutions when needed
- Ask questions to check understanding
- Suggest related topics or practice problems
- End positively with encouragement

UGANDAN CONTEXT EXAMPLES:
- Mathematics: Use market calculations, transport fares, school fees
- Physics: Reference local phenomena, weather patterns, local technology
- Chemistry: Use local materials, cooking processes, environmental issues
- Biology: Reference local plants, animals, health issues in Uganda

REMEMBER: Students may be using this on basic phones with limited data, so keep responses concise but comprehensive.`,

  subjectSpecific: (subjectName) => `You are TutorUG's ${subjectName} specialist, helping Ugandan O-Level students master ${subjectName} for UNEB examinations.

FOCUS AREAS FOR ${subjectName.toUpperCase()}:
- UNEB syllabus alignment
- Past paper patterns
- Common student mistakes
- Ugandan contextual applications
- Step-by-step problem solving
- Examination techniques

Always relate concepts to Ugandan contexts and real-life applications in East Africa.`,

  homeworkHelp: `You are TutorUG's homework assistant. Help students understand and complete their assignments while learning the underlying concepts.

APPROACH:
1. Guide student to solution rather than giving direct answers
2. Explain WHY each step works
3. Point out common mistakes to avoid
4. Suggest similar practice problems
5. Encourage independent thinking

Use Socratic method - ask questions that lead to understanding.`,

  examPrep: `You are TutorUG's examination coach. Prepare students for UNEB examinations with focused revision and practice.

STRATEGY:
1. Review key concepts and formulas
2. Practice past paper questions
3. Time management techniques
4. Common exam pitfalls
5. Stress management and confidence building

Focus on high-impact topics that frequently appear in UNEB papers.`,

  interruptionHandler: `You are an attentive AI tutor who gracefully handles student interruptions during explanations.

WHEN A STUDENT INTERRUPTS:
1. Acknowledge their question/concern immediately
2. Find a natural stopping point in your current explanation
3. Address their specific question or concern thoroughly
4. Confirm they understand your response
5. Offer to continue with the original explanation or explore their question further

Be patient, encouraging, and make them feel heard. Keep responses focused and helpful.`,

  projectGuide: `You are TutorUG's project guidance specialist for Ugandan O-Level and A-Level students.

PROJECT GUIDANCE PRINCIPLES:
1. ALWAYS wait for student's initial idea first - never suggest ideas before they share theirs
2. Help them develop and improve their own ideas
3. Ensure originality - guide them away from overused or copied concepts
4. Focus on problem-solving projects that benefit the community
5. Consider local Ugandan context and challenges
6. Make projects feasible with available resources
7. Include practical implementation steps

APPROACH:
1. Listen to their idea without judgment
2. Ask clarifying questions to understand their vision
3. Help them identify potential challenges
4. Suggest improvements while keeping their core idea
5. Guide them toward original, impactful solutions
6. Provide step-by-step implementation guidance

UGANDAN CONTEXT FOCUS:
- Local problems: agriculture, education, health, environment, transportation
- Available resources: local materials, community support, existing infrastructure
- Cultural relevance: respect local customs and traditions
- Sustainability: long-term benefits for the community`
};

// Generate contextual prompt based on user and session
function generateContextualPrompt(user, session, subject, topic) {
  let prompt = SYSTEM_PROMPTS.generalTutor;

  if (subject) {
    prompt += `\n\nSUBJECT CONTEXT: ${subject.name} - ${subject.description}`;
  }

  if (topic) {
    prompt += `\n\nTOPIC CONTEXT: ${topic.title} - ${topic.description}`;
    prompt += `\nDifficulty Level: ${topic.difficulty}`;
    prompt += `\nClass Level: ${topic.classLevel}`;
  }

  if (user) {
    prompt += `\n\nSTUDENT CONTEXT:`;
    prompt += `\nName: ${user.firstName} ${user.lastName}`;
    prompt += `\nClass: ${user.currentClass}`;
    prompt += `\nRegion: ${user.region || 'Uganda'}`;
    prompt += `\nLearning Style: Adapt explanations to be clear and use local examples`;
  }

  return prompt;
}

// Main AI tutoring function
async function getAITutorResponse(userMessage, user, session, subject = null, topic = null) {
  try {
    const startTime = Date.now();

    // Generate contextual system prompt
    const systemPrompt = generateContextualPrompt(user, session, subject, topic);

    // Build conversation history (last 10 messages for context)
    const recentMessages = await require('../models/ChatMessage').findAll({
      where: { sessionId: session.id },
      order: [['createdAt', 'DESC']],
      limit: 20 // Get last 20 messages for full context
    });

    // Reverse to get chronological order
    const conversationHistory = recentMessages.reverse().map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Add current user message
    conversationHistory.push({
      role: 'user',
      content: userMessage
    });

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: getEnvConfig().OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-10) // Keep last 10 messages for context
      ],
      max_tokens: 1000,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    });

    const aiResponse = completion.choices[0].message.content;
    const tokensUsed = completion.usage.total_tokens;
    const responseTime = Date.now() - startTime;

    return {
      response: aiResponse,
      tokensUsed,
      responseTimeMs: responseTime,
      modelUsed: completion.model
    };

  } catch (error) {
    console.error('AI Service Error:', error);

    // Fallback responses for common errors
    if (error.code === 'insufficient_quota') {
      throw new Error('AI service temporarily unavailable due to high demand. Please try again later.');
    }

    if (error.code === 'rate_limit_exceeded') {
      throw new Error('Too many requests. Please wait a moment before asking another question.');
    }

    // Generic fallback response
    const fallbackResponse = `I'm here to help you with your studies! It looks like I'm having a technical issue right now. 

Could you please rephrase your question? I'm designed to help with:
• Mathematics (algebra, geometry, calculus)
• Physics (mechanics, electricity, waves)  
• Chemistry (reactions, organic, inorganic)
• Biology (cells, genetics, ecology)
• English Language and Literature

Try asking me something like:
"I don't understand how to solve quadratic equations"
Or "Can you explain photosynthesis with a local example?"

Let's work through this together! 💪`;

    return {
      response: fallbackResponse,
      tokensUsed: 0,
      responseTimeMs: 1000,
      modelUsed: 'fallback',
      isFallback: true
    };
  }
}

// Generate practice problems for a topic
async function generatePracticeProblems(topic, difficulty = 'intermediate', count = 5) {
  try {
    const prompt = `Generate ${count} practice problems for the topic "${topic.title}" at ${difficulty} level.

Context: Ugandan O-Level student preparing for UNEB examination.
Subject: ${topic.subject?.name || 'General'}
Class Level: ${topic.classLevel || 'S1-S4'}

Requirements:
1. Problems should be UNEB-style examination questions
2. Include Ugandan context where possible (markets, transport, local scenarios)
3. Provide 4 multiple choice options (A, B, C, D)
4. Indicate the correct answer
5. Include brief explanation for the correct answer
6. Cover key concepts from the topic

Format as JSON array of objects with:
- question: string
- options: array of 4 strings (A, B, C, D)
- correctAnswer: string (just the letter A/B/C/D)
- explanation: string
- difficulty: string
- topic: string`;

    const completion = await openai.chat.completions.create({
      model: getEnvConfig().OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert at creating educational assessment questions. Always respond with valid JSON.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 2000,
      temperature: 0.8
    });

    const response = completion.choices[0].message.content;

    // Parse JSON response
    try {
      const problems = JSON.parse(response);
      return {
        problems: Array.isArray(problems) ? problems : [],
        tokensUsed: completion.usage.total_tokens
      };
    } catch (parseError) {
      console.error('Failed to parse AI-generated problems:', parseError);
      return { problems: [], tokensUsed: completion.usage.total_tokens };
    }

  } catch (error) {
    console.error('Practice problem generation error:', error);
    return { problems: [], tokensUsed: 0 };
  }
}

// Analyze student understanding and provide recommendations
async function analyzeStudentUnderstanding(sessionId, recentMessages = 10) {
  try {
    const messages = await require('../models/ChatMessage').findAll({
      where: { sessionId },
      order: [['createdAt', 'DESC']],
      limit: recentMessages
    });

    const conversationText = messages.reverse()
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n\n');

    const prompt = `Analyze this tutoring conversation and provide insights about the student's understanding:

CONVERSATION:
${conversationText}

Please provide:
1. Current understanding level (beginner/intermediate/advanced)
2. Key concepts the student is struggling with
3. Key concepts the student has mastered
4. Recommended next topics to cover
5. Suggested learning activities
6. Confidence assessment (low/medium/high)

Respond in JSON format with these exact keys: understandingLevel, struggles, mastered, recommendations, activities, confidence`;

    const completion = await openai.chat.completions.create({
      model: getEnvConfig().OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert educational analyst. Always respond with valid JSON.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1000,
      temperature: 0.3
    });

    const response = completion.choices[0].message.content;

    try {
      return JSON.parse(response);
    } catch (parseError) {
      console.error('Failed to parse student analysis:', parseError);
      return {
        understandingLevel: 'unknown',
        struggles: [],
        mastered: [],
        recommendations: [],
        activities: [],
        confidence: 'medium'
      };
    }

  } catch (error) {
    console.error('Student analysis error:', error);
    return null;
  }
}

// Generate topic summary for quick revision
async function generateTopicSummary(topic) {
  try {
    const prompt = `Create a concise summary of the topic "${topic.title}" for Ugandan O-Level students.

Include:
1. Key concepts (3-5 bullet points)
2. Important formulas/equations (if applicable)
3. Common mistakes to avoid
4. UNEB examination tips
5. Quick practice question

Keep it concise but comprehensive. Use simple language and Ugandan examples where relevant.`;

    const completion = await openai.chat.completions.create({
      model: getEnvConfig().OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPTS.generalTutor },
        { role: 'user', content: prompt }
      ],
      max_tokens: 800,
      temperature: 0.5
    });

    return {
      summary: completion.choices[0].message.content,
      tokensUsed: completion.usage.total_tokens
    };

  } catch (error) {
    console.error('Topic summary generation error:', error);
    return { summary: 'Summary generation failed. Please try again.', tokensUsed: 0 };
  }
}

// Moderate and filter content for safety
async function moderateContent(content) {
  try {
    const moderation = await openai.moderations.create({
      input: content
    });

    const result = moderation.results[0];
    return {
      isFlagged: result.flagged,
      categories: result.categories,
      categoryScores: result.category_scores
    };
  } catch (error) {
    console.error('Content moderation error:', error);
    // Default to safe if moderation fails
    return { isFlagged: false, categories: {}, categoryScores: {} };
  }
}

// Handle student interruptions during explanations
async function handleInterruption(interruptionMessage, currentExplanation, user, session, subject = null, topic = null) {
  try {
    const startTime = Date.now();

    const prompt = `A student has interrupted your current explanation with: "${interruptionMessage}"

CURRENT EXPLANATION CONTEXT:
${currentExplanation}

Your task:
1. IMMEDIATELY acknowledge their interruption and concern
2. Find a natural stopping point in your explanation
3. Address their specific question/concern thoroughly
4. Confirm they understand your response
5. Offer to continue the original explanation or explore their question further

Be patient, encouraging, and make them feel heard. Keep responses focused and helpful.

Respond as if you're gracefully pausing your explanation to address their concern.`;

    // Get recent conversation context
    const recentMessages = await require('../models/ChatMessage').findAll({
      where: { sessionId: session.id },
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    const conversationHistory = recentMessages.reverse().map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const completion = await openai.chat.completions.create({
      model: getEnvConfig().OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPTS.interruptionHandler },
        ...conversationHistory.slice(-5),
        { role: 'user', content: prompt }
      ],
      max_tokens: 800,
      temperature: 0.6,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    });

    const aiResponse = completion.choices[0].message.content;
    const tokensUsed = completion.usage.total_tokens;
    const responseTime = Date.now() - startTime;

    return {
      response: aiResponse,
      tokensUsed,
      responseTimeMs: responseTime,
      modelUsed: completion.model,
      interruptionHandled: true
    };

  } catch (error) {
    console.error('Interruption handling error:', error);
    return {
      response: "I apologize for the interruption in my explanation. Could you please repeat your question so I can help you properly?",
      tokensUsed: 0,
      responseTimeMs: 1000,
      modelUsed: 'fallback',
      interruptionHandled: false
    };
  }
}

// Guide students with project ideas (Ugandan curriculum focused)
async function guideProjectDevelopment(projectIdea, user, session, subject = null) {
  try {
    const startTime = Date.now();

    // Check if this is the first time student is sharing an idea
    const previousProjectMessages = await require('../models/ChatMessage').findAll({
      where: {
        sessionId: session.id,
        content: { [require('sequelize').Op.iLike]: '%project%' }
      },
      order: [['createdAt', 'ASC']]
    });

    const isFirstIdea = previousProjectMessages.length === 0;

    let prompt = `STUDENT'S PROJECT IDEA: "${projectIdea}"

STUDENT CONTEXT:
- Class: ${user.currentClass}
- Region: ${user.region || 'Uganda'}
- Subject: ${subject?.name || 'General Project'}

${isFirstIdea ? 'FIRST TIME SHARING IDEA' : 'FOLLOW-UP DISCUSSION'}

Your role as project guide:
1. ${isFirstIdea ? 'Wait for their idea (which you now have)' : 'Continue guiding their existing idea'}
2. Help them develop and improve their own ideas
3. Ensure originality - guide away from overused concepts
4. Focus on problem-solving projects that benefit the community
5. Consider local Ugandan context and available resources
6. Make projects feasible and sustainable

UGANDAN PROJECT FOCUS AREAS:
- Agriculture: Improving local farming, food security
- Education: School improvements, learning tools
- Health: Community health solutions, disease prevention
- Environment: Conservation, waste management, clean water
- Transportation: Local transport improvements
- Technology: Appropriate tech solutions for communities

RESPONSE STRUCTURE:
1. Acknowledge and show enthusiasm for their idea
2. Ask clarifying questions to understand their vision
3. Identify strengths and potential challenges
4. Suggest improvements while keeping their core idea
5. Guide toward practical implementation steps
6. Ensure originality and community benefit`;

    const completion = await openai.chat.completions.create({
      model: getEnvConfig().OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPTS.projectGuide },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1200,
      temperature: 0.7,
      presence_penalty: 0.2,
      frequency_penalty: 0.1
    });

    const aiResponse = completion.choices[0].message.content;
    const tokensUsed = completion.usage.total_tokens;
    const responseTime = Date.now() - startTime;

    return {
      response: aiResponse,
      tokensUsed,
      responseTimeMs: responseTime,
      modelUsed: completion.model,
      isFirstIdea,
      projectGuidance: true
    };

  } catch (error) {
    console.error('Project guidance error:', error);
    return {
      response: `Thank you for sharing your project idea! I love that you're thinking about solving real problems in our community.

Your idea about "${projectIdea.substring(0, 50)}..." sounds interesting. To help you develop this further, could you tell me:

1. What specific problem are you trying to solve?
2. Who will benefit from your project?
3. What materials or resources do you have access to?
4. How do you plan to implement and test your solution?

Let's work together to make this project amazing! 💪`,
      tokensUsed: 0,
      responseTimeMs: 1000,
      modelUsed: 'fallback',
      projectGuidance: false
    };
  }
}

// Check project originality against common ideas
async function checkProjectOriginality(projectIdea, user) {
  try {
    const prompt = `Analyze this student project idea for originality and provide feedback:

STUDENT PROJECT: "${projectIdea}"

STUDENT INFO:
- Class: ${user.currentClass}
- Region: ${user.region || 'Uganda'}

TASK:
1. Assess how original this idea is (scale of 1-10, where 10 is highly original)
2. Identify if it's similar to common/overused projects
3. Suggest ways to make it more unique if needed
4. Confirm it's feasible for a ${user.currentClass} student

COMMON PROJECT IDEAS TO AVOID:
- Solar-powered phone chargers
- Plastic bottle gardens
- School timetable apps
- Water purification using charcoal
- Biogas from food waste
- Rainwater harvesting systems

Focus on helping them create something unique and impactful.

Respond in JSON format:
{
  "originalityScore": number (1-10),
  "isOriginal": boolean,
  "similarTo": string (if not original),
  "suggestions": array of strings,
  "feasible": boolean,
  "recommendations": string
}`;

    const completion = await openai.chat.completions.create({
      model: getEnvConfig().OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert at evaluating student project originality. Always respond with valid JSON.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 800,
      temperature: 0.3
    });

    const response = completion.choices[0].message.content;

    try {
      const analysis = JSON.parse(response);
      return {
        analysis,
        tokensUsed: completion.usage.total_tokens
      };
    } catch (parseError) {
      console.error('Failed to parse originality analysis:', parseError);
      return {
        analysis: {
          originalityScore: 7,
          isOriginal: true,
          similarTo: null,
          suggestions: ['Your idea has good potential!'],
          feasible: true,
          recommendations: 'Continue developing this idea - it shows creativity.'
        },
        tokensUsed: completion.usage.total_tokens
      };
    }

  } catch (error) {
    console.error('Project originality check error:', error);
    return {
      analysis: {
        originalityScore: 7,
        isOriginal: true,
        similarTo: null,
        suggestions: [],
        feasible: true,
        recommendations: 'Unable to analyze originality right now, but your idea looks promising!'
      },
      tokensUsed: 0
    };
  }
}

// Generate project implementation steps
async function generateProjectSteps(projectIdea, user) {
  try {
    const prompt = `Create a detailed implementation plan for this student project:

PROJECT: "${projectIdea}"

STUDENT: ${user.currentClass} student from ${user.region || 'Uganda'}

Create a step-by-step guide including:
1. Research phase
2. Planning and design
3. Implementation steps
4. Testing and evaluation
5. Presentation preparation

Consider:
- Available resources for a ${user.currentClass} student
- Local Ugandan context and materials
- Time constraints (typical project timeline)
- Safety considerations
- Community involvement where appropriate

Format as a clear, actionable step-by-step guide.`;

    const completion = await openai.chat.completions.create({
      model: getEnvConfig().OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPTS.projectGuide },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1500,
      temperature: 0.4
    });

    return {
      steps: completion.choices[0].message.content,
      tokensUsed: completion.usage.total_tokens
    };

  } catch (error) {
    console.error('Project steps generation error:', error);
    return {
      steps: `Here's a general project implementation guide:

1. **Research Phase (1-2 weeks)**
   - Research your topic thoroughly
   - Identify available materials and resources
   - Talk to community members about the problem

2. **Planning Phase (1 week)**
   - Define your project goals clearly
   - Create a detailed plan and timeline
   - Gather all necessary materials

3. **Implementation Phase (2-3 weeks)**
   - Build/test your solution step by step
   - Document your progress regularly
   - Adjust your approach as needed

4. **Testing & Evaluation (1 week)**
   - Test your solution thoroughly
   - Get feedback from others
   - Measure your project's success

5. **Presentation (1 week)**
   - Prepare a clear presentation
   - Practice explaining your project
   - Be ready to answer questions

Remember to work safely and ask for help when needed! Good luck! 🚀`,
      tokensUsed: 0
    };
  }
}

// Estimate token usage for cost calculation
function estimateTokens(text) {
  // Rough estimation: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4);
}

module.exports = {
  getAITutorResponse,
  generatePracticeProblems,
  analyzeStudentUnderstanding,
  generateTopicSummary,
  moderateContent,
  handleInterruption,
  guideProjectDevelopment,
  checkProjectOriginality,
  generateProjectSteps,
  estimateTokens,
  SYSTEM_PROMPTS
};
