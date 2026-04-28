const axios = require('axios');
const HomeworkSession = require('../models/HomeworkSession');
const User = require('../models/User');

class AIHomeworkAssistant {
  constructor() {
    this.openAIKey = process.env.OPENAI_API_KEY;
    this.geminiKey = process.env.GOOGLE_AI_API_KEY;
    this.model = 'gpt-4';
    this.maxTokens = 2000;
    this.temperature = 0.7;
    
    // Subject-specific system prompts (Optimized for Sri Lankan National Syllabus)
    this.subjectPrompts = {
      mathematics: `You are an expert mathematics tutor for Sri Lankan students (Grade 6-13, including O/L and A/L Combined Mathematics). 
        Help students understand concepts step-by-step. 
        Don't just give answers - guide them through the problem-solving process.
        Use clear explanations, visual descriptions when helpful, and check for understanding.
        Follow the Sri Lankan National Curriculum standards.`,
      
      physics: `You are an expert physics tutor specialized in the Sri Lankan A/L Physics syllabus. 
        Explain concepts with real-world examples from a Sri Lankan context.
        Use analogies to make abstract concepts concrete. 
        Always show the relevant formulas and explain the units (SI units).
        Encourage students to think about cause and effect relationships.`,
      
      chemistry: `You are an expert chemistry tutor for Sri Lankan A/L students. 
        Explain chemical reactions, organic mechanisms, and inorganic concepts clearly.
        Use molecular visualization descriptions when helpful.
        Explain safety considerations and connect concepts to everyday life in Sri Lanka.`,
      
      biological_sciences: `You are an expert biological sciences tutor for Sri Lankan A/L students. 
        Explain biological processes, anatomy, and biodiversity (including local flora and fauna) clearly.
        Use analogies to explain complex systems.`,
      
      tamil: `You are an expert Tamil language and literature tutor for Sri Lankan students.
        Help with grammar (Ilakkanam), comprehension, and analysis of A/L and O/L Tamil literature.
        Provide constructive feedback in clear Tamil (using Unicode).`,
      
      sinhala: `You are an expert Sinhala language and literature tutor for Sri Lankan students.
        Help with grammar, comprehension, and analysis of A/L and O/L Sinhala literature.
        Provide constructive feedback in clear Sinhala (using Unicode).`,
      
      science: `You are an expert Science tutor for Sri Lankan students (Grade 6-9). 
        Explain natural phenomena, basic physics, chemistry, and biology concepts clearly.
        Use observations from daily life in Sri Lanka to make science interesting and relatable. 
        Focus on curiosity and the scientific method.`,

      english: `You are an expert English language tutor for Sri Lankan students.
        Help with grammar, vocabulary, composition, and literature.
        Provide clear explanations and encourage students to practice writing and speaking.`,

      history: `You are an expert History tutor for Sri Lankan students.
        Explain historical events, civilizations, and the history of Sri Lanka clearly.
        Provide context and help students understand the significance of historical developments.`,

      geography: `You are an expert Geography tutor for Sri Lankan students.
        Explain physical and human geography, maps, and the geography of Sri Lanka clearly.
        Help students understand the relationship between humans and their environment.`,

      commerce: `You are an expert Commerce and Business Studies tutor for Sri Lankan A/L students in the Commercial Stream.
        Help with Accounting, Business Studies, and Economics concepts.
        Use real-world examples from the Sri Lankan business environment.
        Explain financial statements, business law, and economic principles clearly.`,

      general: `You are a helpful educational assistant for Sri Lankan students (Grades 6-13).
        Guide students to answers rather than just providing them.
        Be encouraging, patient, and culturally aware of the Sri Lankan academic environment.`
    };

    this.syllabusConstraints = {
      '6': `CURRICULUM CONSTRAINTS (GRADE 6 - Sri Lankan National Syllabus):
        - Mathematics Units: Prathama Sankhya (Natural Numbers), Dashama (Decimals), Bhinna (Fractions), Parimithiya (Perimeter), Vargaphala (Area), Kona (Angles), Dishawa (Directions).
        - Science Units: Jeevi ha Ajeevi dravya (Living/Non-living), Jalaya (Water), Shakha (Plants), Tapaya (Heat), Dhvaniya (Sound), Alokaya (Light), Balaya ha Chalanaya (Force/Motion).
        - Deep Understanding Requirements: For Grade 6, always relate abstract concepts to everyday home/school objects (e.g., explaining perimeter using a garden fence, or decimals using currency cents).
        - Language: Use very simple Sinhalish/English terminology. Focus on 'Environment' based examples.`,
      
      '7': `CURRICULUM CONSTRAINTS (GRADE 7 - Sri Lankan National Syllabus):
        - Mathematics Units: Prathishathaya (Percentages), Anupathaya (Ratios), Sarala Samikarana (Simple Equations), Rekha ha Kona (Line properties).
        - Science Units: Manava Indriya Paddhathi (Human Organ Systems), Sarala Paripatha (Simple Circuits), Chumbakathvaya (Magnetism), Vayugolaya (Atmosphere).`,
      
      '8': `CURRICULUM CONSTRAINTS (GRADE 8 - Sri Lankan National Syllabus):
        - Mathematics Units: Vargayamula (Square Roots), Kula (Sets), Bijiya Prakashana (Algebraic Expressions), Ghanaphalaya (Volume).
        - Science Units: Shvasanaya (Respiration), Kshudra Jeevin (Micro-organisms), Taranga (Waves), Amila ha Bhshma (Acids/Bases).`,
      
      '9': `CURRICULUM CONSTRAINTS (GRADE 9 - Sri Lankan National Syllabus):
        - Mathematics Units: Thathvika Sankhya (Real Numbers), Yugala Samikarana (Simultaneous Equations), Jyamithiya (Geometry proofs), Siyambala (Map reading).
        - Science Units: Paramanvaka Viruhaya (Atomic Structure - Bohr model), Payala (Tissues), Vidyuthiya (Electricity - V=IR), Avartithana Chakraya (Periodic Table).`,
      
      '10': `CURRICULUM CONSTRAINTS (GRADE 10 - O/L Part 1):
        - Mathematics Units: Varga Samikarana (Quadratic Equations), Laguganaka (Logarithms), Trikonamithiya (Trigonometry), Vruththa (Circles), Vruththa Jyamithiya (Circle Geometry).
        - Science Units: Molaya ha Gananaya (Moles), Anuvanshikaya (Inheritance), Balaya ha Chalana Niyama (Newton's Laws), Karya ha Shakthiya (Work/Energy).
        - General: Strictly align with Sri Lankan O/L syllabus terminology.`,
      
      '11': `CURRICULUM CONSTRAINTS (GRADE 11 - O/L Final):
        - Mathematics Units: Vruththa Jyamithiya (Advanced), Trikonamithiya (Advanced), Sambhavithawa (Probability), Sankhyanaya (Statistics).
        - Science Units: Karbanika Rasayanaya (Organic Chemistry basics), Vidyut Chumbakathvaya (Electromagnetism), Parisarika Jeeva Vidyawa (Environmental Bio).`,
        
      '12': `CURRICULUM CONSTRAINTS (GRADE 12/13 - A/L):
        - Combined Mathematics: Calculus (Kalanaya), Statics (Sthithika Vidyawa), Dynamics (Chalaka Vidyawa).
        - Physics/Bio/Chem: Advanced terminology as per Sri Lankan National Syllabus.
        - Focus on deep conceptual derivation and exam techniques.`
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
      
      const user = await User.findById(userId);
      const userLanguage = user?.language || 'English';

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
        language: userLanguage,
        messageHistory: [],
        conceptsCovered: new Set(),
        hintsGiven: 0,
        understandingChecks: 0
      });
      
      // Generate welcome message
      const welcomeMessage = await this.generateWelcomeMessage(subject, topic, grade, userLanguage);
      
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
   * @param {String} sessionId - Session ID
   * @param {String} message - Student's message
   * @param {Object} imageData - Optional image data { mimeType: 'image/jpeg', data: 'base64...' }
   * @param {String} audioData - Optional base64 audio data
   * @returns {Object} AI response
   */
  async processMessage(sessionId, message, imageData = null, audioData = null) {
    try {
      const session = await HomeworkSession.findById(sessionId);
      if (!session || session.status !== 'active') {
        throw new Error('Session not found or inactive');
      }
      
      let memory = this.sessionMemory.get(sessionId);
      if (!memory) {
        // Recover memory from MongoDB after server restart
        memory = {
          subject: session.subject || 'general',
          grade: session.grade,
          topic: session.topic,
          messageHistory: session.messages
            .map(m => ({ role: m.role, content: m.content }))
            .filter(m => {
              // Filter out broken [LIMITED MODE] fallback responses from history
              const text = typeof m.content === 'string' ? m.content : (m.content?.text || '');
              return !text.includes('[LIMITED MODE]');
            }),
          conceptsCovered: new Set(session.conceptsCovered || []),
          hintsGiven: session.hintsGiven || 0,
          understandingChecks: session.understandingChecks || 0,
          language: 'English' // Default for recovered sessions, could be enhanced to fetch user
        };
        this.sessionMemory.set(sessionId, memory);
      }
      
      // Add student message
      const messageContent = (imageData || audioData) 
        ? { text: message, image: imageData, audio: audioData } 
        : message;
        
      await this.addMessageToSession(session._id, 'user', messageContent);
      memory.messageHistory.push({ role: 'user', content: messageContent });
      
      // Analyze the question type
      const questionText = typeof message === 'object' ? (message.text || '') : (message || '');
      const questionType = this.analyzeQuestionType(questionText);
      
      // Build context-aware prompt
      const systemPrompt = this.buildSystemPrompt(memory);
      const messages = this.buildMessageHistory(memory);
      
      // Call Unified AI API (prioritizing Gemini/OpenAI over fallback)
      const aiResponse = await this.callAI(systemPrompt, messages);
      
      // Post-process response
      const processedResponse = this.postProcessResponse(aiResponse, questionType, memory);
      
      // Track concepts covered
      this.extractConcepts(processedResponse, memory);
      
      // Add AI response to session as string content
      const aiContent = processedResponse.content || 'I am sorry, I could not generate a response.';
      await this.addMessageToSession(session._id, 'assistant', aiContent);
      memory.messageHistory.push({ role: 'assistant', content: aiContent });
      
      // Update session stats
      await this.updateSessionStats(session._id, memory);
      
      return processedResponse;
      
    } catch (error) {
      console.error('Error in AIHomeworkAssistant.processMessage:', error);
      // Fallback response for better UX
      return {
        content: "I'm having trouble connecting to my brain right now. Please try again in a moment.",
        responseType: 'error',
        followUpQuestions: ["Would you like to try sending the message again?"],
        resources: []
      };
    }
  }

  /**
   * Generate welcome message based on subject and topic
   */
  async generateWelcomeMessage(subject, topic, grade, language = 'English') {
    const topicStr = topic || 'any topic';
    const prompts = {
        mathematics: `Hi! I'm your AI Math tutor. I can help you with ${topicStr} (Combined Mathematics/General) at grade ${grade} level. 
        What specific problem or concept would you like help with? 
        Remember, I'll guide you through the solution rather than just giving you the answer.`,
      
      physics: `Hello! I'm here to help you understand physics concepts, especially ${topicStr}. 
        Whether it's mechanics, electricity, or waves - ask me anything! 
        I'll use real-world examples to make it clearer.`,
      
      general: `Hi there! I'm your AI study assistant. I can help you with homework questions, explain concepts, or work through problems. 
        What subject or topic would you like help with today?`
    };
    
    let welcome = prompts[subject] || prompts.general;
    if (language === 'Sinhala') {
      welcome = `ආයුබෝවන්! මම ඔබේ AI අධ්‍යයන සහායකයා වෙමි. ${topicStr} සම්බන්ධයෙන් ඔබට ඇති ගැටලුව කුමක්ද? මම ඔබට උදව් කිරීමට සූදානම්!`;
    } else if (language === 'Tamil') {
      welcome = `வணக்கம்! நான் உங்கள் AI கல்வி உதவியாளர். ${topicStr} பற்றி உங்களுக்கு ஏதேனும் சந்தேகங்கள் உள்ளதா? நான் உங்களுக்கு உதவ தயாராக உள்ளேன்!`;
    }
    return welcome;
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
    
    // Add Grade-Specific Syllabus Constraints
    const gradeKey = memory.grade?.toString();
    const constraints = this.syllabusConstraints[gradeKey] || (parseInt(gradeKey) >= 12 ? this.syllabusConstraints['12'] : '');
    
    const guardrails = `
      IMPORTANT GUARDRAILS:
      1. ONLY answer questions related to the student's registered grade (${memory.grade}) and subject (${memory.subject}).
      2. If the student asks about concepts from a HIGHER GRADE (e.g. asking for Grade 8 math while in Grade 6), politely REFUSE. Explain that they should focus on mastering their current Grade ${memory.grade} syllabus first.
      3. Strictly REFUSE any non-academic, harmful, or off-topic requests (e.g. video games, entertainment, non-scholastic gossip, or solving full exam papers).
      4. EXPLAIN DEEPLY: For the allowed Grade ${memory.grade} topics, provide deep, intuitive explanations. Use multiple simple metaphors and at least TWO real-world examples from a Sri Lankan context (e.g. tea estates, local markets, school cricket, etc.).
      5. LEVEL-APPROPRIATE: For Grade 6-8, use very simple language, short sentences, and engaging tone. Avoid complex jargon unless explaining it simply. For Grade 10-13, be more technical and exam-oriented.
      6. MULTIMODAL AWARENESS: If the student uploads an image or voice note, acknowledge it and relate your explanation directly to what they shared.
      7. If asked about a forbidden topic, say: "I am your Grade ${memory.grade} ${memory.subject} assistant. I am restricted to helping you excel in your current curriculum. Let's get back to [Current Topic]!"`;

    if (constraints) {
      prompt += `\n\nSTRICT CURRICULUM & GRADE LOCK:\n${constraints}\n${guardrails}`;
    } else {
      // Fallback for missing grade info or other grades
      prompt += `\n\nGRADE CONTEXT: Grade ${memory.grade || 'Unknown'}\n${guardrails}`;
      
      if (memory.grade && parseInt(memory.grade) <= 8) {
        prompt += '\nUse simple language appropriate for younger students. Break down concepts into small steps.';
      } else if (memory.grade && parseInt(memory.grade) >= 11) {
        prompt += '\nYou can use more advanced terminology and complex examples appropriate for advanced students.';
      }
    }
    
    // Add topic context if available
    if (memory.topic) {
      prompt += `\nThe student is currently studying: ${memory.topic}`;
    }

    // NEW: Multilingual Guard for Tamil and Sinhala
    const prefLang = memory.language || 'English';
    prompt += `\n\nLANGUAGE INSTRUCTIONS:
    - The student's preferred language is: ${prefLang}.
    - ALWAYS reply primarily in ${prefLang}.
    - If explaining complex concepts, you may provide the English term in parentheses.
    - If requested, provide a transliteration into Latin script to help with pronunciation.
    - Always maintain the educational persona described above, regardless of the language used.
    - For National Syllabus (O/L, A/L) questions, use the terminology officially recognized by the Sri Lankan Department of Examinations.`;
    
    return prompt;
  }

  /**
   * Build message history for context
   */
  buildMessageHistory(memory) {
    // Get last 10 messages for context (to stay within token limits)
    const recentMessages = memory.messageHistory.slice(-10);
    
    return recentMessages.map(msg => {
      // Handle both string and complex content (with images)
      if (typeof msg.content === 'object' && msg.content.image) {
        return {
          role: msg.role,
          content: msg.content.text,
          image: msg.content.image,
          audio: msg.content.audio
        };
      }
      return {
        role: msg.role,
        content: msg.content
      };
    });
  }

  /**
   * Call AI with automatic model fallback and retry
   */
  async callAI(systemPrompt, messages) {
    if (this.geminiKey) {
      // Recommended: gemini-1.5-flash (fast/free), gemini-1.5-pro (complex)
      const geminiModels = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro', 'gemini-1.0-pro'];
      
      for (const model of geminiModels) {
        try {
          return await this.callGemini(systemPrompt, messages, model);
        } catch (error) {
          const status = error.response?.status;
          const errorMsg = error.response?.data?.error?.message || error.message;
          console.warn(`Gemini [${model}] failed (${status || 'ERR'}): ${errorMsg.substring(0, 100)}`);
          
          // If rate limited, try next model immediately
          if (status === 429 || status === 503) continue;
          // For other errors, also try next model
          continue;
        }
      }
    }

    // 2. Try OpenAI if key exists
    if (this.openAIKey) {
      try {
        return await this.callOpenAI(systemPrompt, messages);
      } catch (error) {
        console.warn('OpenAI fallback failed:', error.message);
      }
    }

    // 3. Last resort: subject-aware local fallback
    console.warn('All AI providers failed, using local fallback');
    return this.generateSubjectAwareFallback(messages);
  }

  /**
   * Call Google Gemini API with retry support
   */
  async callGemini(systemPrompt, messages, modelName = 'gemini-1.5-flash') {
    const maxRetries = 2;
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          // Exponential backoff: 1s, 2s
          await new Promise(r => setTimeout(r, attempt * 1000));
        }

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${this.geminiKey}`;
        
        // Map history to Gemini format (supporting Multimodal)
        const contents = messages.map(msg => {
          const parts = [];
          
          let textContent = '';
          if (typeof msg.content === 'object' && msg.content !== null) {
            textContent = msg.content.text || '';
          } else {
            textContent = msg.content || '';
          }
          parts.push({ text: textContent });


          // Add image part if exists
          const imageData = msg.image || (typeof msg.content === 'object' && msg.content !== null ? msg.content.image : null);
          if (imageData) {
            const base64Data = imageData.data.includes('base64,') 
              ? imageData.data.split('base64,')[1] 
              : imageData.data;

            parts.push({
              inline_data: {
                mime_type: imageData.mimeType || 'image/jpeg',
                data: base64Data
              }
            });
          }

          // Add audio part if exists
          const audioData = msg.audio || (typeof msg.content === 'object' && msg.content !== null ? msg.content.audio : null);
          if (audioData) {
            parts.push({
              inline_data: {
                mime_type: 'audio/webm', // Common for browser recordings
                data: audioData
              }
            });
          }

          return {
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts
          };
        });

        // Gemini requires first message to be 'user' role - filter out leading model messages
        while (contents.length > 0 && contents[0].role === 'model') {
          contents.shift();
        }

        // If no user messages remain, wrap the original query
        if (contents.length === 0) {
          contents.push({ role: 'user', parts: [{ text: 'Hello, I need help.' }] });
        }

        const response = await axios.post(geminiUrl, {
          system_instruction: {
            parts: [{ text: systemPrompt }]
          },
          contents: contents,
          generationConfig: {
            temperature: this.temperature,
            maxOutputTokens: this.maxTokens,
            topP: 0.95,
            topK: 40
          }
        }, {
          timeout: 30000 // 30 second timeout
        });

        if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          return response.data.candidates[0].content.parts[0].text;
        }
        
        throw new Error('Unexpected Gemini API response format');
      } catch (error) {
        lastError = error;
        const status = error.response?.status;
        
        // Only retry on 503 (overloaded) - not on 429 (quota) or 404 (model not found)
        if (status === 503 && attempt < maxRetries) {
          continue;
        }
        break;
      }
    }

    throw lastError;
  }

  /**
   * Call OpenAI API
   */
  async callOpenAI(systemPrompt, messages) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages
          ],
          max_tokens: this.maxTokens,
          temperature: this.temperature
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
   * Generate a much better subject-aware fallback when AI keys are missing
   */
  generateSubjectAwareFallback(messages) {
    const lastMessage = [...messages].reverse().find(m => m.role === 'user')?.content || '';
    const query = lastMessage.toLowerCase();
    
    let subject = 'general';
    if (query.match(/math|solve|calculate|equation/)) subject = 'mathematics';
    else if (query.match(/physic|force|energy|motion/)) subject = 'physics';
    else if (query.match(/chem|molecule|atom|reaction/)) subject = 'chemistry';
    else if (query.match(/bio|cell|organ|plant|animal/)) subject = 'biological_sciences';

    const fallbacks = {
      mathematics: "I'm currently in high-stability mode. To solve this math problem, try identifying your 'known' variables vs 'unknowns' first. Are you using the quadratic formula or basic algebra here? Let's check the first step together.",
      physics: "Physics concepts are best understood by visualizing the forces at play. For your specific question, consider which Sri Lankan A/L laws apply (like Newton's or Kirchhoff's). What constants do we have?",
      general: "I'm working in a limited capacity right now. To help you better, could you specify the subject and the specific part of the Sri Lankan curriculum this relates to?"
    };

    return `[LIMITED MODE] ${fallbacks[subject] || fallbacks.general}\n\n(Note: AI key not fully authorized for this session. Please check system configurations.)`;
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
        { returnDocument: 'after' }
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
      
      const response = await this.callAI(
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
