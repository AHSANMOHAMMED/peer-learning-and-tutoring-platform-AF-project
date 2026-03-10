const axios = require('axios');
const HomeworkSession = require('../models/HomeworkSession');
const User = require('../models/User');

class AIHomeworkAssistant {
  constructor() {
    this.openAIKey = process.env.OPENAI_API_KEY;
    this.model = 'gpt-4';
    this.maxTokens = 2000;
    this.temperature = 0.7;
    
    // Subject-specific system prompts
    this.subjectPrompts = {
      mathematics: `You are an expert mathematics tutor for students grades 6-13. 
        Help students understand concepts step-by-step. 
        Don't just give answers - guide them through the problem-solving process.
        Use clear explanations, visual descriptions when helpful, and check for understanding.
        Format math expressions clearly using LaTeX-style notation where appropriate.`,
      
      physics: `You are an expert physics tutor. Explain concepts with real-world examples.
        Use analogies to make abstract concepts concrete. 
        Always show the relevant formulas and explain the units.
        Encourage students to think about cause and effect relationships.`,
      
      chemistry: `You are an expert chemistry tutor. Explain chemical reactions, equations, and concepts clearly.
        Use molecular visualization descriptions when helpful.
        Explain safety considerations when relevant.
        Connect concepts to everyday life examples.`,
      
      biology: `You are an expert biology tutor. Explain biological processes clearly and accurately.
        Use analogies to explain complex systems.
        Connect concepts to real-world health and environmental applications.`,
      
      english: `You are an expert English literature and language tutor.
        Help with grammar, comprehension, essay writing, and literary analysis.
        Provide constructive feedback on writing.
        Explain rules with clear examples.`,
      
      history: `You are an expert history tutor. Present historical facts accurately.
        Help students understand cause-and-effect in historical events.
        Encourage critical thinking about sources and perspectives.`,
      
      general: `You are a helpful educational assistant for students grades 6-13.
        Guide students to answers rather than just providing them.
        Encourage critical thinking and understanding.
        Be encouraging and patient.`
    };
    
    // Conversation memory for each session
    this.sessionMemory = new Map();
  }

  /**
   * Start a new homework help session
   * @param {String} userId - User ID
   * @param {Object} params - Session parameters
   * @returns {Object} Created session
   */
  async startSession(userId, params) {
    try {
      const { subject, topic, grade, specificQuestion } = params;
      
      // Create session record
      const session = await HomeworkSession.create({
        user: userId,
        subject: subject || 'general',
        topic,
        grade,
        status: 'active',
        messages: [],
        startedAt: new Date()
      });
      
      // Initialize conversation memory
      this.sessionMemory.set(session._id.toString(), {
        subject: subject || 'general',
        grade,
        topic,
        messageHistory: [],
        conceptsCovered: new Set(),
        hintsGiven: 0,
        understandingChecks: 0
      });
      
      // Generate welcome message
      const welcomeMessage = await this.generateWelcomeMessage(subject, topic, grade);
      
      await this.addMessageToSession(session._id, 'assistant', welcomeMessage);
      
      return {
        sessionId: session._id,
        welcomeMessage,
        subject,
        topic
      };
      
    } catch (error) {
      console.error('Error starting AI homework session:', error);
      throw error;
    }
  }

  /**
   * Process student message and get AI response
   * @param {String} sessionId - Session ID
   * @param {String} message - Student's message
   * @returns {Object} AI response
   */
  async processMessage(sessionId, message) {
    try {
      const session = await HomeworkSession.findById(sessionId);
      if (!session || session.status !== 'active') {
        throw new Error('Session not found or inactive');
      }
      
      const memory = this.sessionMemory.get(sessionId);
      if (!memory) {
        throw new Error('Session memory not found');
      }
      
      // Add student message
      await this.addMessageToSession(session._id, 'user', message);
      memory.messageHistory.push({ role: 'user', content: message });
      
      // Analyze the question type
      const questionType = this.analyzeQuestionType(message);
      
      // Build context-aware prompt
      const systemPrompt = this.buildSystemPrompt(memory);
      const messages = this.buildMessageHistory(memory);
      
      // Call OpenAI API
      const aiResponse = await this.callOpenAI(systemPrompt, messages);
      
      // Post-process response
      const processedResponse = this.postProcessResponse(aiResponse, questionType, memory);
      
      // Track concepts covered
      this.extractConcepts(processedResponse, memory);
      
      // Add AI response to session
      await this.addMessageToSession(session._id, 'assistant', processedResponse.content);
      memory.messageHistory.push({ role: 'assistant', content: processedResponse.content });
      
      // Update session stats
      await this.updateSessionStats(session._id, memory);
      
      return processedResponse;
      
    } catch (error) {
      console.error('Error processing message:', error);
      throw error;
    }
  }

  /**
   * Generate welcome message based on subject and topic
   */
  async generateWelcomeMessage(subject, topic, grade) {
    const prompts = {
      mathematics: `Hi! I'm your AI Math tutor. I can help you with ${topic || 'any math topic'} at grade ${grade} level. 
        What specific problem or concept would you like help with? 
        Remember, I'll guide you through the solution rather than just giving you the answer.`,
      
      physics: `Hello! I'm here to help you understand physics concepts, especially ${topic || 'physics principles'}. 
        Whether it's mechanics, electricity, or waves - ask me anything! 
        I'll use real-world examples to make it clearer.`,
      
      general: `Hi there! I'm your AI study assistant. I can help you with homework questions, explain concepts, or work through problems. 
        What subject or topic would you like help with today?`
    };
    
    return prompts[subject] || prompts.general;
  }

  /**
   * Analyze what type of question is being asked
   */
  analyzeQuestionType(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('solve') || lowerMessage.includes('calculate') || /\d+.+\=/.test(message)) {
      return 'calculation';
    }
    if (lowerMessage.includes('explain') || lowerMessage.includes('what is') || lowerMessage.includes('how does')) {
      return 'explanation';
    }
    if (lowerMessage.includes('check') || lowerMessage.includes('review') || lowerMessage.includes('correct')) {
      return 'review';
    }
    if (lowerMessage.includes('hint') || lowerMessage.includes('clue') || lowerMessage.includes('help me start')) {
      return 'hint_request';
    }
    if (lowerMessage.match(/(why|when|where|who|which)/)) {
      return 'conceptual';
    }
    
    return 'general';
  }

  /**
   * Build system prompt based on context
   */
  buildSystemPrompt(memory) {
    let prompt = this.subjectPrompts[memory.subject] || this.subjectPrompts.general;
    
    // Add grade-appropriate language hints
    if (memory.grade && parseInt(memory.grade) <= 8) {
      prompt += '\nUse simple language appropriate for younger students. Break down concepts into small steps.';
    } else if (memory.grade && parseInt(memory.grade) >= 11) {
      prompt += '\nYou can use more advanced terminology and complex examples appropriate for advanced students.';
    }
    
    // Add topic context if available
    if (memory.topic) {
      prompt += `\nThe student is currently studying: ${memory.topic}`;
    }
    
    return prompt;
  }

  /**
   * Build message history for context
   */
  buildMessageHistory(memory) {
    // Get last 10 messages for context (to stay within token limits)
    const recentMessages = memory.messageHistory.slice(-10);
    
    return recentMessages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }

  /**
   * Call OpenAI API
   */
  async callOpenAI(systemPrompt, messages) {
    try {
      if (!this.openAIKey) {
        throw new Error('OpenAI API key not configured');
      }

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages
          ],
          max_tokens: this.maxTokens,
          temperature: this.temperature,
          presence_penalty: 0.1,
          frequency_penalty: 0.1
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openAIKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;

    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }

  /**
   * Post-process AI response based on question type
   */
  postProcessResponse(aiResponse, questionType, memory) {
    let content = aiResponse;
    let responseType = 'general';
    let followUpQuestions = [];
    let resources = [];
    
    // Customize based on question type
    switch (questionType) {
      case 'calculation':
        responseType = 'step_by_step_solution';
        // Ensure step-by-step format
        if (!content.includes('Step') && !content.includes('step')) {
          content = `Let me walk you through this step-by-step:\n\n${content}`;
        }
        break;
        
      case 'explanation':
        responseType = 'concept_explanation';
        // Add understanding check
        if (memory.understandingChecks < 3) {
          followUpQuestions.push('Does this explanation make sense to you?');
          followUpQuestions.push('Would you like me to explain it in a different way?');
          memory.understandingChecks++;
        }
        break;
        
      case 'hint_request':
        responseType = 'hint';
        memory.hintsGiven++;
        content = `💡 Here's a hint to get you started:\n\n${content}\n\nTry working through it with this hint, and let me know what you come up with!`;
        break;
        
      case 'review':
        responseType = 'review_feedback';
        break;
    }
    
    // Extract any resource suggestions
    const resourcePattern = /\*\*(Practice|Watch|Read|Try):?\*\*\s*(.+?)(?=\n|$)/g;
    let match;
    while ((match = resourcePattern.exec(content)) !== null) {
      resources.push({
        type: match[1],
        description: match[2].trim()
      });
    }
    
    return {
      content,
      responseType,
      followUpQuestions,
      resources,
      conceptsCovered: Array.from(memory.conceptsCovered),
      stats: {
        hintsGiven: memory.hintsGiven,
        understandingChecks: memory.understandingChecks,
        totalMessages: memory.messageHistory.length
      }
    };
  }

  /**
   * Extract key concepts from response
   */
  extractConcepts(response, memory) {
    // Simple keyword extraction - could be enhanced with NLP
    const conceptPatterns = [
      /the concept of (\w+\s*\w*)/gi,
      /called (\w+\s*\w*)/gi,
      /known as (\w+\s*\w*)/gi,
      /(\w+) formula/gi,
      /(\w+) theorem/gi,
      /(\w+) law/gi,
      /(\w+) principle/gi
    ];
    
    conceptPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(response)) !== null) {
        memory.conceptsCovered.add(match[1].toLowerCase().trim());
      }
    });
  }

  /**
   * Add message to session
   */
  async addMessageToSession(sessionId, role, content) {
    await HomeworkSession.findByIdAndUpdate(sessionId, {
      $push: {
        messages: {
          role,
          content,
          timestamp: new Date()
        }
      }
    });
  }

  /**
   * Update session statistics
   */
  async updateSessionStats(sessionId, memory) {
    await HomeworkSession.findByIdAndUpdate(sessionId, {
      $set: {
        conceptsCovered: Array.from(memory.conceptsCovered),
        hintsGiven: memory.hintsGiven,
        understandingChecks: memory.understandingChecks,
        lastActivityAt: new Date()
      }
    });
  }

  /**
   * Get session summary
   * @param {String} sessionId - Session ID
   * @returns {Object} Session summary
   */
  async getSessionSummary(sessionId) {
    try {
      const session = await HomeworkSession.findById(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }
      
      const memory = this.sessionMemory.get(sessionId);
      
      return {
        sessionId: session._id,
        subject: session.subject,
        topic: session.topic,
        status: session.status,
        duration: session.endedAt 
          ? (session.endedAt - session.startedAt) / 1000 / 60 // minutes
          : (new Date() - session.startedAt) / 1000 / 60,
        totalMessages: session.messages.length,
        conceptsCovered: session.conceptsCovered || [],
        hintsGiven: session.hintsGiven || 0,
        understandingChecks: session.understandingChecks || 0,
        keyTakeaways: this.generateKeyTakeaways(session, memory)
      };
      
    } catch (error) {
      console.error('Error getting session summary:', error);
      throw error;
    }
  }

  /**
   * Generate key takeaways from session
   */
  generateKeyTakeaways(session, memory) {
    if (!memory) return [];
    
    const takeaways = [];
    
    // Extract from concepts covered
    if (memory.conceptsCovered.size > 0) {
      takeaways.push(`Reviewed ${memory.conceptsCovered.size} key concepts`);
    }
    
    // Check for problem-solving
    const hasCalculations = session.messages.some(m => 
      m.content.includes('Step') || m.content.includes('=')
    );
    if (hasCalculations) {
      takeaways.push('Practiced problem-solving techniques');
    }
    
    // Check for understanding
    if (memory.understandingChecks > 0) {
      takeaways.push('Verified understanding through discussion');
    }
    
    return takeaways;
  }

  /**
   * End session
   * @param {String} sessionId - Session ID
   * @returns {Object} Final summary
   */
  async endSession(sessionId) {
    try {
      const session = await HomeworkSession.findByIdAndUpdate(
        sessionId,
        {
          $set: {
            status: 'completed',
            endedAt: new Date()
          }
        },
        { new: true }
      );
      
      // Clean up memory
      this.sessionMemory.delete(sessionId);
      
      // Generate final summary
      const summary = await this.getSessionSummary(sessionId);
      
      return {
        message: 'Session completed! Great work today! 🎉',
        summary
      };
      
    } catch (error) {
      console.error('Error ending session:', error);
      throw error;
    }
  }

  /**
   * Get active sessions for user
   * @param {String} userId - User ID
   * @returns {Array} Active sessions
   */
  async getUserActiveSessions(userId) {
    return await HomeworkSession.find({
      user: userId,
      status: 'active'
    }).sort({ lastActivityAt: -1 });
  }

  /**
   * Get session history for user
   * @param {String} userId - User ID
   * @param {Number} limit - Number of sessions
   * @returns {Array} Session history
   */
  async getUserSessionHistory(userId, limit = 10) {
    return await HomeworkSession.find({
      user: userId,
      status: 'completed'
    })
      .sort({ endedAt: -1 })
      .limit(limit)
      .select('subject topic startedAt endedAt conceptsCovered');
  }

  /**
   * Generate practice problems based on session
   * @param {String} sessionId - Session ID
   * @returns {Array} Practice problems
   */
  async generatePracticeProblems(sessionId) {
    try {
      const session = await HomeworkSession.findById(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }
      
      const prompt = `Based on this ${session.subject} session about ${session.topic || 'general topics'}, 
        generate 3 practice problems at grade ${session.grade} level.
        Format each as:
        Problem 1: [Question]
        Hint: [Optional hint]
        Answer: [Solution]
        
        Make sure problems are similar to what was discussed but not identical.`;
      
      const response = await this.callOpenAI(
        this.subjectPrompts[session.subject] || this.subjectPrompts.general,
        [{ role: 'user', content: prompt }]
      );
      
      // Parse response into structured problems
      const problems = this.parsePracticeProblems(response);
      
      return problems;
      
    } catch (error) {
      console.error('Error generating practice problems:', error);
      throw error;
    }
  }

  /**
   * Parse practice problems from AI response
   */
  parsePracticeProblems(response) {
    const problems = [];
    const problemPattern = /Problem (\d+):\s*([\s\S]*?)(?=Problem \d+:|$)/g;
    
    let match;
    while ((match = problemPattern.exec(response)) !== null) {
      const problemText = match[2].trim();
      
      // Extract hint and answer
      const hintMatch = problemText.match(/Hint:\s*([\s\S]*?)(?=Answer:|$)/);
      const answerMatch = problemText.match(/Answer:\s*([\s\S]*?)$/);
      
      problems.push({
        question: problemText.split('Hint:')[0].trim(),
        hint: hintMatch ? hintMatch[1].trim() : null,
        answer: answerMatch ? answerMatch[1].trim() : null,
        difficulty: 'medium'
      });
    }
    
    return problems;
  }
}

module.exports = new AIHomeworkAssistant();
