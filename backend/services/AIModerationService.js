const axios = require('axios');
const ModerationReport = require('../models/ModerationReport');
const User = require('../models/User');
const GroupRoom = require('../models/GroupRoom');
const PeerSession = require('../models/PeerSession');

class AIModerationService {
  constructor() {
    this.openAIKey = process.env.OPENAI_API_KEY;
    this.confidenceThreshold = 0.7;
    this.autoModerationEnabled = process.env.AI_MODERATION_ENABLED === 'true';
    
    // Categories for moderation
    this.categories = {
      harassment: {
        severity: 'high',
        action: 'flag',
        description: 'Bullying, intimidation, or harassment'
      },
      hate_speech: {
        severity: 'high',
        action: 'block',
        description: 'Discriminatory or hate speech'
      },
      inappropriate: {
        severity: 'medium',
        action: 'filter',
        description: 'Inappropriate content for educational platform'
      },
      spam: {
        severity: 'low',
        action: 'filter',
        description: 'Spam or promotional content'
      },
      cheating: {
        severity: 'high',
        action: 'flag',
        description: 'Academic dishonesty or cheating requests'
      },
      personal_info: {
        severity: 'medium',
        action: 'filter',
        description: 'Sharing personal information'
      },
      violence: {
        severity: 'high',
        action: 'block',
        description: 'Violence or threats'
      },
      self_harm: {
        severity: 'urgent',
        action: 'block_alert',
        description: 'Self-harm or suicide content'
      }
    };
  }

  /**
   * Analyze content for moderation
   * @param {String} content - Content to analyze
   * @param {String} context - Context (chat, session, post)
   * @param {Object} metadata - Additional metadata
   * @returns {Object} Moderation result
   */
  async analyzeContent(content, context = 'chat', metadata = {}) {
    try {
      if (!this.openAIKey) {
        console.warn('OpenAI API key not configured for moderation');
        return { safe: true, flagged: false };
      }

      // Quick pre-check for obvious issues
      const preCheck = this.quickPreCheck(content);
      if (preCheck.flagged) {
        return preCheck;
      }

      // AI-based analysis
      const aiResult = await this.callOpenAIModeration(content, context);
      
      // Combine results
      const result = {
        safe: aiResult.safe,
        flagged: aiResult.flagged,
        categories: aiResult.categories,
        confidence: aiResult.confidence,
        action: this.determineAction(aiResult),
        reason: aiResult.reason,
        suggestedResponse: aiResult.suggestedResponse
      };

      // Log if flagged
      if (result.flagged && this.autoModerationEnabled) {
        await this.logModerationEvent(content, result, metadata);
      }

      return result;

    } catch (error) {
      console.error('AI Moderation error:', error);
      // Fail safe - allow content but log error
      return { 
        safe: true, 
        flagged: false,
        error: 'Moderation service temporarily unavailable'
      };
    }
  }

  /**
   * Quick pre-check using keyword matching
   */
  quickPreCheck(content) {
    const lowerContent = content.toLowerCase();
    
    // Check for obvious profanity patterns
    const profanityPatterns = [
      /\b(f+u+c+k+|s+h+i+t+|b+i+t+c+h+|a+s+s+h+o+l+e+)\b/gi,
      /\b(d+i+c+k+|p+u+s+s+y+|c+u+n+t+)\b/gi,
      /\b(w+h+o+r+e+|s+l+u+t+|r+e+t+a+r+d+)\b/gi
    ];
    
    for (const pattern of profanityPatterns) {
      if (pattern.test(lowerContent)) {
        return {
          safe: false,
          flagged: true,
          categories: ['inappropriate'],
          confidence: 0.9,
          action: 'filter',
          reason: 'Contains inappropriate language',
          source: 'keyword_filter'
        };
      }
    }

    // Check for personal info patterns (emails, phones)
    const personalInfoPatterns = [
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
      /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // Phone
      /\b\d{10,}\b/ // Long number sequences
    ];

    for (const pattern of personalInfoPatterns) {
      if (pattern.test(content)) {
        return {
          safe: false,
          flagged: true,
          categories: ['personal_info'],
          confidence: 0.85,
          action: 'filter',
          reason: 'May contain personal information',
          source: 'pattern_filter'
        };
      }
    }

    return { safe: true, flagged: false };
  }

  /**
   * Call OpenAI for content moderation
   */
  async callOpenAIModeration(content, context) {
    const prompt = `You are a content moderator for an educational platform serving students ages 10-18.

Analyze the following content for moderation:
Context: ${context}
Content: "${content}"

Evaluate for these categories:
1. harassment - Bullying, intimidation, personal attacks
2. hate_speech - Discriminatory content based on race, religion, gender, etc.
3. inappropriate - Sexual content, profanity, age-inappropriate material
4. spam - Promotional, repetitive, irrelevant content
5. cheating - Requests to cheat on homework, exams, or assignments
6. personal_info - Sharing personal contact information
7. violence - Threats, violent language, harmful content
8. self_harm - Content related to self-harm or suicide

Respond in this exact JSON format:
{
  "safe": boolean,
  "flagged": boolean,
  "categories": ["category_name"],
  "confidence": 0.0-1.0,
  "severity": "low|medium|high|urgent",
  "reason": "explanation",
  "suggestedResponse": "appropriate response if action needed"
}

If the content is asking for help with homework or academic questions, it is SAFE and should NOT be flagged for cheating. Only flag as cheating if it's explicitly asking to cheat, copy answers, or bypass academic integrity.

Provide your analysis:`;

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 500,
          temperature: 0.1
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openAIKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const aiResponse = response.data.choices[0].message.content;
      
      // Extract JSON from response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback if JSON parsing fails
      return { safe: true, flagged: false };

    } catch (error) {
      console.error('OpenAI moderation API error:', error);
      return { safe: true, flagged: false };
    }
  }

  /**
   * Determine action based on moderation result
   */
  determineAction(result) {
    if (!result.flagged) return 'allow';

    const highestSeverity = result.categories.reduce((max, cat) => {
      const severity = this.categories[cat]?.severity || 'low';
      const severityValue = { low: 1, medium: 2, high: 3, urgent: 4 }[severity] || 0;
      return Math.max(max, severityValue);
    }, 0);

    switch (highestSeverity) {
      case 4: // urgent
        return 'block_alert';
      case 3: // high
        return 'block';
      case 2: // medium
        return 'flag';
      default:
        return 'filter';
    }
  }

  /**
   * Moderate chat message in real-time
   */
  async moderateChatMessage(message, roomId, userId) {
    const result = await this.analyzeContent(message, 'chat', {
      roomId,
      userId,
      timestamp: new Date()
    });

    if (result.action === 'block' || result.action === 'block_alert') {
      return {
        allowed: false,
        message: result.suggestedResponse || 'This message violates our community guidelines.',
        reason: result.reason
      };
    }

    if (result.action === 'filter') {
      return {
        allowed: true,
        filtered: true,
        warning: 'Please keep conversations appropriate for an educational platform.'
      };
    }

    if (result.action === 'flag') {
      // Allow but flag for review
      return {
        allowed: true,
        flagged: true,
        message: 'Your message has been sent but may be reviewed by moderators.'
      };
    }

    return { allowed: true };
  }

  /**
   * Moderate session content
   */
  async moderateSessionContent(content, sessionId, sessionType) {
    const result = await this.analyzeContent(content, `session_${sessionType}`, {
      sessionId,
      timestamp: new Date()
    });

    if (result.action === 'block_alert') {
      // Alert moderators immediately
      await this.alertModerators(result, sessionId, sessionType);
    }

    return result;
  }

  /**
   * Check for academic integrity (cheating)
   */
  async checkAcademicIntegrity(question, context) {
    const prompt = `Analyze this question for academic integrity on an educational platform:

Question: "${question}"
Context: ${context}

Is this asking to:
1. Get direct answers to homework/test questions (cheating)
2. Understand concepts and learn (legitimate help)
3. Check work or get feedback (legitimate)

Respond in JSON:
{
  "isCheating": boolean,
  "confidence": 0.0-1.0,
  "reason": "explanation",
  "suggestedGuidance": "how to properly ask for help"
}`;

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 300,
          temperature: 0.1
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openAIKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const aiResponse = response.data.choices[0].message.content;
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return { isCheating: false, confidence: 0 };

    } catch (error) {
      console.error('Academic integrity check error:', error);
      return { isCheating: false, confidence: 0 };
    }
  }

  /**
   * Log moderation event
   */
  async logModerationEvent(content, result, metadata) {
    try {
      await ModerationReport.create({
        type: 'ai_moderated',
        content: content.substring(0, 1000), // Limit content size
        categories: result.categories,
        confidence: result.confidence,
        action: result.action,
        reason: result.reason,
        userId: metadata.userId,
        roomId: metadata.roomId,
        sessionId: metadata.sessionId,
        context: metadata.context,
        timestamp: new Date()
      });

      // If high severity, create alert
      if (result.action === 'block' || result.action === 'block_alert') {
        // Could send to admin dashboard, Slack, etc.
        console.warn('High severity moderation:', result);
      }

    } catch (error) {
      console.error('Error logging moderation event:', error);
    }
  }

  /**
   * Alert moderators for urgent issues
   */
  async alertModerators(result, sessionId, sessionType) {
    // Implementation would connect to admin alert system
    // Could send to Slack, email, or admin dashboard
    console.warn(`URGENT: Moderation alert in ${sessionType} session ${sessionId}`, result);
  }

  /**
   * Get moderation statistics
   */
  async getModerationStats(timeRange = '24h') {
    const hours = parseInt(timeRange);
    const startDate = new Date(Date.now() - hours * 60 * 60 * 1000);

    const stats = await ModerationReport.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          type: 'ai_moderated'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          byAction: {
            $push: '$action'
          },
          byCategory: {
            $push: '$categories'
          },
          avgConfidence: { $avg: '$confidence' }
        }
      }
    ]);

    return stats[0] || { total: 0, byAction: [], byCategory: [], avgConfidence: 0 };
  }

  /**
   * Get pending moderation queue
   */
  async getModerationQueue(limit = 50) {
    return await ModerationReport.find({
      status: 'pending',
      type: 'ai_moderated'
    })
      .sort({ createdAt: -1, confidence: -1 })
      .limit(limit)
      .populate('userId', 'name email')
      .populate('roomId', 'title')
      .populate('sessionId', 'subject');
  }

  /**
   * Review and update moderation decision
   */
  async reviewModeration(reportId, decision, moderatorId, notes) {
    const report = await ModerationReport.findById(reportId);
    if (!report) {
      throw new Error('Report not found');
    }

    report.status = decision === 'approve' ? 'approved' : 'rejected';
    report.moderatorId = moderatorId;
    report.moderatorNotes = notes;
    report.reviewedAt = new Date();

    await report.save();

    // If overturned, could restore content, notify user, etc.
    return report;
  }

  /**
   * Batch moderate content
   */
  async batchModerate(contents) {
    const results = await Promise.all(
      contents.map(content => this.analyzeContent(content))
    );

    return results.map((result, index) => ({
      content: contents[index],
      ...result
    }));
  }
}

module.exports = new AIModerationService();
