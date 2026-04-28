const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const LectureCourse = require('../models/LectureCourse');
const PeerSession = require('../models/PeerSession');

class AIService {
  constructor() {
    // Configuration for AI providers
    this.openAIKey = process.env.OPENAI_API_KEY;
    this.googleAIKey = process.env.GOOGLE_AI_API_KEY;
    this.deepgramKey = process.env.DEEPGRAM_API_KEY;
    
    this.providers = {
      openai: {
        transcription: 'whisper-1',
        chat: 'gpt-4',
        embeddings: 'text-embedding-ada-002'
      },
      google: {
        transcription: 'speech-to-text',
        chat: 'gemini-pro',
        embeddings: 'embedding-001'
      }
    };
  }

  /**
   * Generate general AI chat response
   * @param {String} message - User message
   * @param {Array} history - Message history
   * @param {Object} options - Additional options (subject, grade)
   * @returns {Object} AI response
   */
  async generateChatResponse(message, history = [], options = {}) {
    try {
      if (this.googleAIKey) {
        return await this.chatWithGoogle(message, history, options);
      } else if (this.openAIKey) {
        return await this.chatWithOpenAI(message, history, options);
      } else {
        return {
          content: "[STABILITY MODE] I'm ready to assist you. Ask me any question!",
          role: 'assistant'
        };
      }
    } catch (error) {
      console.error('Chat generation error:', error);
      throw error;
    }
  }

  /**
   * Chat using Google Gemini
   */
  async chatWithGoogle(message, history, options) {
    const geminiModels = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
    let lastError;

    for (const model of geminiModels) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.googleAIKey}`;
        
        const contents = history.map(h => ({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }]
        }));

        contents.push({
          role: 'user',
          parts: [{ text: message }]
        });

        const systemInstruction = `You are an expert educational mentor for Sri Lankan students. 
        Subject: ${options.subject || 'General'}
        Grade: ${options.grade || 'N/A'}`;

        const response = await axios.post(geminiUrl, {
          contents,
          system_instruction: {
            parts: [{ text: systemInstruction }]
          },
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000
          }
        }, { timeout: 15000 });

        return {
          content: response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '',
          role: 'assistant'
        };
      } catch (error) {
        lastError = error;
        console.warn(`Gemini [${model}] failed: ${error.message}`);
        if (error.response?.status === 404) continue;
        if (error.response?.status === 429) continue;
        break; // Other errors might be terminal
      }
    }

    throw lastError;
  }

  /**
   * Chat using OpenAI GPT
   */
  async chatWithOpenAI(message, history, options) {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: this.providers.openai.chat,
        messages: [
          {
            role: 'system',
            content: `You are an expert educational mentor for Sri Lankan students. Subject: ${options.subject || 'General'}. Grade: ${options.grade || 'N/A'}`
          },
          ...history.map(h => ({ role: h.role, content: h.content })),
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${this.openAIKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      content: response.data.choices[0].message.content,
      role: 'assistant'
    };
  }

  /**
   * Transcribe audio/video recording using AI
   * @param {String} recordingUrl - URL to recording file
   * @param {String} provider - AI provider ('openai', 'google')
   * @returns {Object} Transcription result
   */
  async transcribeRecording(recordingUrl, provider = 'openai') {
    try {
      console.log(`Starting transcription for: ${recordingUrl}`);
      
      let transcript = '';
      let segments = [];
      let confidence = 0;

      if (provider === 'openai' && this.openAIKey) {
        const result = await this.transcribeWithOpenAI(recordingUrl);
        transcript = result.text;
        segments = result.segments || [];
        confidence = result.confidence || 0.95;
      } else if (provider === 'google' && this.googleAIKey) {
        const result = await this.transcribeWithGoogle(recordingUrl);
        transcript = result.text;
        segments = result.segments || [];
        confidence = result.confidence || 0.90;
      } else if (this.deepgramKey) {
        const result = await this.transcribeWithDeepgram(recordingUrl);
        transcript = result.text;
        segments = result.segments || [];
        confidence = result.confidence || 0.92;
      } else {
        // Mock transcription for development
        transcript = this.generateMockTranscript();
        segments = this.generateMockSegments();
        confidence = 0.85;
      }

      return {
        transcript,
        segments,
        confidence,
        wordCount: transcript.split(' ').length,
        duration: this.estimateDuration(transcript),
        provider: provider,
        status: 'completed',
        processedAt: new Date()
      };

    } catch (error) {
      console.error('Transcription error:', error);
      throw error;
    }
  }

  /**
   * Transcribe using OpenAI Whisper
   */
  async transcribeWithOpenAI(recordingUrl) {
    try {
      // Download file temporarily
      const response = await axios.get(recordingUrl, { responseType: 'stream' });
      const tempFile = `/tmp/recording-${Date.now()}.mp4`;
      const writer = fs.createWriteStream(tempFile);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      // Call OpenAI Whisper API
      const form = new FormData();
      form.append('file', fs.createReadStream(tempFile));
      form.append('model', this.providers.openai.transcription);
      form.append('language', 'en');
      form.append('response_format', 'verbose_json');
      form.append('timestamp_granularities', ['word', 'segment']);

      const whisperResponse = await axios.post(
        'https://api.openai.com/v1/audio/transcriptions',
        form,
        {
          headers: {
            ...form.getHeaders(),
            'Authorization': `Bearer ${this.openAIKey}`
          }
        }
      );

      // Cleanup temp file
      fs.unlinkSync(tempFile);

      return {
        text: whisperResponse.data.text,
        segments: whisperResponse.data.segments?.map(s => ({
          start: s.start,
          end: s.end,
          text: s.text,
          confidence: s.avg_logprob
        })) || [],
        confidence: 0.95
      };

    } catch (error) {
      console.error('OpenAI transcription error:', error);
      throw error;
    }
  }

  /**
   * Transcribe using Google Speech-to-Text
   */
  async transcribeWithGoogle(recordingUrl) {
    // Implementation would use Google Cloud Speech-to-Text API
    // This is a placeholder
    throw new Error('Google transcription not implemented');
  }

  /**
   * Transcribe using Deepgram
   */
  async transcribeWithDeepgram(recordingUrl) {
    try {
      const response = await axios.post(
        'https://api.deepgram.com/v1/listen',
        {
          url: recordingUrl
        },
        {
          headers: {
            'Authorization': `Token ${this.deepgramKey}`,
            'Content-Type': 'application/json'
          },
          params: {
            punctuate: true,
            utterances: true,
            diarize: true, // Speaker identification
            summarize: true
          }
        }
      );

      const result = response.data.results;
      
      return {
        text: result.channels[0].alternatives[0].transcript,
        segments: result.channels[0].alternatives[0].words?.map(w => ({
          start: w.start,
          end: w.end,
          text: w.word,
          speaker: w.speaker
        })) || [],
        confidence: result.channels[0].alternatives[0].confidence,
        summary: result.channels[0].alternatives[0].summaries?.[0]?.summary
      };

    } catch (error) {
      console.error('Deepgram transcription error:', error);
      throw error;
    }
  }

  /**
   * Generate session summary from transcript
   * @param {String} transcript - Session transcript
   * @param {String} type - Summary type ('bullet', 'detailed', 'key-points')
   * @returns {Object} Summary result
   */
  async generateSummary(transcript, type = 'bullet') {
    try {
      let summary = '';
      let keyPoints = [];
      let actionItems = [];

      if (this.openAIKey) {
        const result = await this.summarizeWithOpenAI(transcript, type);
        summary = result.summary;
        keyPoints = result.keyPoints;
        actionItems = result.actionItems;
      } else if (this.googleAIKey) {
        const result = await this.summarizeWithGoogle(transcript, type);
        summary = result.summary;
        keyPoints = result.keyPoints;
        actionItems = result.actionItems;
      } else {
        // Mock summary
        const mockResult = this.generateMockSummary(transcript, type);
        summary = mockResult.summary;
        keyPoints = mockResult.keyPoints;
        actionItems = mockResult.actionItems;
      }

      return {
        summary,
        keyPoints,
        actionItems,
        wordCount: transcript.split(' ').length,
        summaryLength: summary.split(' ').length,
        type,
        generatedAt: new Date()
      };

    } catch (error) {
      console.error('Summary generation error:', error);
      throw error;
    }
  }

  /**
   * Summarize using OpenAI GPT
   */
  async summarizeWithOpenAI(transcript, type) {
    const prompts = {
      bullet: `Summarize the following educational session transcript into 5-7 bullet points highlighting key concepts taught:\n\n${transcript}`,
      detailed: `Provide a comprehensive summary of this educational session, including main topics covered, key explanations given, and important takeaways:\n\n${transcript}`,
      'key-points': `Extract the 10 most important learning points from this session transcript:\n\n${transcript}`
    };

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: this.providers.openai.chat,
        messages: [
          {
            role: 'system',
            content: 'You are an educational assistant that creates clear, concise summaries of learning sessions.'
          },
          {
            role: 'user',
            content: prompts[type] || prompts.bullet
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${this.openAIKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0].message.content;
    
    // Parse key points and action items
    const lines = content.split('\n').filter(line => line.trim());
    const keyPoints = lines.filter(line => 
      line.match(/^\d+\.|^[-•]|^\*/)
    ).map(line => line.replace(/^\d+\.\s*|^[-•]\s*|^\*\s*/, '').trim());

    const actionItems = lines.filter(line =>
      line.toLowerCase().includes('action') ||
      line.toLowerCase().includes('homework') ||
      line.toLowerCase().includes('practice') ||
      line.toLowerCase().includes('review')
    ).map(line => line.replace(/^\d+\.\s*|^[-•]\s*|^\*\s*/, '').trim());

    return {
      summary: content,
      keyPoints: keyPoints.slice(0, 10),
      actionItems: actionItems.slice(0, 5)
    };
  }

  /**
   * Summarize using Google Gemini
   */
  async summarizeWithGoogle(transcript, type) {
    const prompts = {
      bullet: `Summarize the following educational session transcript into 5-7 bullet points highlighting key concepts taught:\n\n${transcript}`,
      detailed: `Provide a comprehensive summary of this educational session, including main topics covered, key explanations given, and important takeaways:\n\n${transcript}`,
      'key-points': `Extract the 10 most important learning points from this session transcript:\n\n${transcript}`
    };

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.googleAIKey}`;
    
    const response = await axios.post(geminiUrl, {
      contents: [{
        role: 'user',
        parts: [{ text: prompts[type] || prompts.bullet }]
      }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1000
      }
    });

    const content = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Parse key points and action items (same logic as OpenAI for consistency)
    const lines = content.split('\n').filter(line => line.trim());
    const keyPoints = lines.filter(line => 
      line.match(/^\d+\.|^[-•]|^\*/)
    ).map(line => line.replace(/^\d+\.\s*|^[-•]\s*|^\*\s*/, '').trim());

    const actionItems = lines.filter(line =>
      line.toLowerCase().includes('action') ||
      line.toLowerCase().includes('homework') ||
      line.toLowerCase().includes('practice') ||
      line.toLowerCase().includes('review')
    ).map(line => line.replace(/^\d+\.\s*|^[-•]\s*|^\*\s*/, '').trim());

    return {
      summary: content,
      keyPoints: keyPoints.slice(0, 10),
      actionItems: actionItems.slice(0, 5)
    };
  }

  /**
   * Generate personalized learning recommendations
   * @param {String} userId - User ID
   * @param {Object} userData - User's learning history and preferences
   * @returns {Object} Recommendations
   */
  async generateLearningRecommendations(userId, userData) {
    try {
      const {
        completedSessions = [],
        weakTopics = [],
        strongTopics = [],
        preferredSubjects = [],
        learningStyle = 'visual', // visual, auditory, kinesthetic
        grade,
        goals = []
      } = userData;

      let recommendations = {
        suggestedCourses: [],
        suggestedPeers: [],
        studyPlan: null,
        resources: [],
        reasoning: ''
      };

      if (this.openAIKey) {
        recommendations = await this.recommendationsWithOpenAI(userData);
      } else if (this.googleAIKey) {
        recommendations = await this.recommendationsWithGoogle(userData);
      } else {
        recommendations = this.generateMockRecommendations(userData);
      }

      return recommendations;

    } catch (error) {
      console.error('Recommendation generation error:', error);
      throw error;
    }
  }

  /**
   * Get recommendations using OpenAI
   */
  async recommendationsWithOpenAI(userData) {
    const prompt = `Given a student with the following profile:
- Grade: ${userData.grade}
- Strong topics: ${userData.strongTopics.join(', ')}
- Weak topics: ${userData.weakTopics.join(', ')}
- Preferred subjects: ${userData.preferredSubjects.join(', ')}
- Learning style: ${userData.learningStyle}
- Goals: ${userData.goals.join(', ')}

Provide:
1. 3-5 specific learning recommendations
2. Suggested study schedule
3. Type of content formats that would work best
4. Areas to focus on for improvement`;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: this.providers.openai.chat,
        messages: [
          {
            role: 'system',
            content: 'You are an educational advisor that provides personalized learning recommendations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 1500
      },
      {
        headers: {
          'Authorization': `Bearer ${this.openAIKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0].message.content;
    
    // Parse recommendations
    const lines = content.split('\n').filter(line => line.trim());
    
    return {
      suggestedCourses: this.extractCourses(lines),
      suggestedPeers: [], // Would be populated from matching algorithm
      studyPlan: this.extractStudyPlan(lines),
      resources: this.extractResources(lines),
      reasoning: content,
      generatedAt: new Date()
    };
  }

  /**
   * Get recommendations using Google Gemini
   */
  async recommendationsWithGoogle(userData) {
    const prompt = `Given a student with the following profile:
- Grade: ${userData.grade}
- Strong topics: ${userData.strongTopics.join(', ')}
- Weak topics: ${userData.weakTopics.join(', ')}
- Preferred subjects: ${userData.preferredSubjects.join(', ')}
- Learning style: ${userData.learningStyle}
- Goals: ${userData.goals.join(', ')}

Provide:
1. 3-5 specific learning recommendations
2. Suggested study schedule
3. Type of content formats that would work best
4. Areas to focus on for improvement

Format the output clearly.`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.googleAIKey}`;
    
    const response = await axios.post(geminiUrl, {
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 1500
      }
    });

    const content = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const lines = content.split('\n').filter(line => line.trim());
    
    return {
      suggestedCourses: this.extractCourses(lines),
      suggestedPeers: [],
      studyPlan: this.extractStudyPlan(lines),
      resources: this.extractResources(lines),
      reasoning: content,
      generatedAt: new Date()
    };
  }

  /**
   * Analyze engagement patterns from session data
   * @param {Array} sessionData - Array of session participation data
   * @returns {Object} Engagement analysis
   */
  async analyzeEngagement(sessionData) {
    const analysis = {
      overallScore: 0,
      attentionPatterns: [],
      participationLevel: 'medium',
      suggestions: [],
      heatmapData: []
    };

    if (sessionData.length === 0) return analysis;

    // Calculate metrics
    const avgDuration = sessionData.reduce((sum, s) => sum + (s.duration || 0), 0) / sessionData.length;
    const interactionRate = sessionData.filter(s => s.interactions > 5).length / sessionData.length;
    const completionRate = sessionData.filter(s => s.completed).length / sessionData.length;

    analysis.overallScore = Math.round(
      (avgDuration / 60 * 0.3 + interactionRate * 0.4 + completionRate * 0.3) * 100
    );

    analysis.participationLevel = analysis.overallScore > 80 ? 'high' : 
                                  analysis.overallScore > 50 ? 'medium' : 'low';

    // Generate heatmap data
    analysis.heatmapData = sessionData.map((session, index) => ({
      session: index + 1,
      attention: Math.random() * 100, // Would be calculated from actual data
      participation: session.interactions || 0,
      duration: session.duration || 0
    }));

    // Generate suggestions
    if (analysis.overallScore < 60) {
      analysis.suggestions.push('Consider shorter, more interactive sessions');
      analysis.suggestions.push('Add more polls and Q&A breaks');
    }
    if (interactionRate < 0.3) {
      analysis.suggestions.push('Encourage more student participation through group activities');
    }

    return analysis;
  }

  /**
   * Generate quiz questions from content
   * @param {String} content - Educational content
   * @param {Number} numQuestions - Number of questions to generate
   * @returns {Array} Quiz questions
   */
  async generateQuizQuestions(content, numQuestions = 5) {
    try {
      if (this.openAIKey) {
        return await this.generateQuizQuestionsWithOpenAI(content, numQuestions);
      } else if (this.googleAIKey) {
        return await this.generateQuizQuestionsWithGoogle(content, numQuestions);
      } else {
        return this.generateMockQuizQuestions(numQuestions);
      }
    } catch (error) {
      console.error('Quiz generation error:', error);
      return this.generateMockQuizQuestions(numQuestions);
    }
  }

  /**
   * Generate quiz questions using OpenAI
   */
  async generateQuizQuestionsWithOpenAI(content, numQuestions) {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: this.providers.openai.chat,
        messages: [
          {
            role: 'system',
            content: 'You are an educational quiz generator. Create multiple choice questions based on provided content.'
          },
          {
            role: 'user',
            content: `Generate ${numQuestions} multiple choice quiz questions based on this content:\n\n${content}\n\nFormat each question as:
Q: [Question text]
A: [Option 1]
B: [Option 2]
C: [Option 3]
D: [Option 4]
Correct: [A/B/C/D]
Explanation: [Why this is correct]`
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${this.openAIKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return this.parseQuizQuestions(response.data.choices[0].message.content);
  }

  /**
   * Generate quiz questions using Google Gemini
   */
  async generateQuizQuestionsWithGoogle(content, numQuestions) {
    const prompt = `Generate ${numQuestions} multiple choice quiz questions based on this content:\n\n${content}\n\nFormat each question as:
Q: [Question text]
A: [Option 1]
B: [Option 2]
C: [Option 3]
D: [Option 4]
Correct: [A/B/C/D]
Explanation: [Why this is correct]`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.googleAIKey}`;
    
    const response = await axios.post(geminiUrl, {
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2000
      }
    });

    return this.parseQuizQuestions(response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '');
  }

  /**
   * Extract quiz questions from AI response
   */
  parseQuizQuestions(content) {
    const questions = [];
    const blocks = content.split(/\n\n/);
    
    for (const block of blocks) {
      const lines = block.split('\n').filter(line => line.trim());
      if (lines.length < 6) continue;

      const questionMatch = lines[0].match(/^Q:\s*(.+)/);
      const correctMatch = lines.find(l => l.match(/^Correct:\s*([A-D])/));
      
      if (questionMatch && correctMatch) {
        questions.push({
          question: questionMatch[1],
          options: lines.slice(1, 5).map(l => l.replace(/^[A-D]:\s*/, '').trim()),
          correct: correctMatch[1],
          explanation: lines.find(l => l.match(/^Explanation:/))?.replace(/^Explanation:\s*/, '') || ''
        });
      }
    }

    return questions;
  }

  // Helper methods
  estimateDuration(transcript) {
    const words = transcript.split(' ').length;
    // Average speaking rate: 130 words per minute
    return Math.ceil(words / 130);
  }

  generateMockTranscript() {
    return `Welcome to today's session on quadratic equations. We'll cover how to solve them using the quadratic formula. The formula is x equals negative b plus or minus the square root of b squared minus 4ac, all over 2a. Let's work through some examples together.`;
  }

  generateMockSegments() {
    return [
      { start: 0, end: 5, text: 'Welcome to today\'s session', confidence: 0.95 },
      { start: 5, end: 12, text: 'on quadratic equations', confidence: 0.92 },
      { start: 12, end: 20, text: 'We\'ll cover how to solve them', confidence: 0.88 }
    ];
  }

  generateMockSummary(transcript, type) {
    return {
      summary: `This session covered the fundamentals of quadratic equations, including the quadratic formula and solving techniques.`,
      keyPoints: [
        'Introduction to quadratic equations',
        'The quadratic formula: x = (-b ± √(b² - 4ac)) / 2a',
        'How to identify coefficients a, b, and c',
        'Solving example problems',
        'Checking solutions'
      ],
      actionItems: [
        'Practice solving 10 quadratic equation problems',
        'Review the quadratic formula',
        'Complete homework assignment'
      ]
    };
  }

  generateMockRecommendations(userData) {
    return {
      suggestedCourses: [
        { title: 'Advanced Algebra', reason: 'Builds on your strong math foundation' },
        { title: 'Physics Fundamentals', reason: 'Aligns with your science interests' }
      ],
      suggestedPeers: [],
      studyPlan: {
        weeklyHours: 10,
        focusAreas: userData.weakTopics,
        recommendedFormat: 'interactive video with practice problems'
      },
      resources: [
        { type: 'video', topic: 'Quadratic Equations' },
        { type: 'practice', topic: 'Algebra Problems' }
      ],
      reasoning: 'Based on your profile, focusing on interactive content will help improve engagement.'
    };
  }

  generateMockQuizQuestions(numQuestions) {
    return Array(numQuestions).fill(null).map((_, i) => ({
      question: `Sample question ${i + 1}?`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correct: 'A',
      explanation: 'This is the correct answer because...'
    }));
  }

  extractCourses(lines) {
    return lines
      .filter(line => line.toLowerCase().includes('course') || line.toLowerCase().includes('class'))
      .map(line => ({
        title: line.replace(/^[-•\d.\s]*/, '').trim(),
        reason: 'Recommended based on your profile'
      }));
  }

  extractStudyPlan(lines) {
    const planLines = lines.filter(line => 
      line.toLowerCase().includes('schedule') ||
      line.toLowerCase().includes('week') ||
      line.toLowerCase().includes('hours')
    );
    
    return {
      description: planLines.join(' '),
      weeklyHours: 10,
      sessionsPerWeek: 3
    };
  }

  extractResources(lines) {
    return lines
      .filter(line => line.toLowerCase().includes('resource') || line.toLowerCase().includes('material'))
      .map(line => ({
        type: 'article',
        title: line.replace(/^[-•\d.\s]*/, '').trim()
      }));
  }
}

module.exports = new AIService();
