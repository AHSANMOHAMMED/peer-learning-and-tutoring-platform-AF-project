const User = require('../models/User');
const PeerSession = require('../models/PeerSession');
const LectureCourse = require('../models/LectureCourse');
const HomeworkSession = require('../models/HomeworkSession');
const UserGamification = require('../models/UserGamification');
const axios = require('axios');

class AIPersonalizationService {
  constructor() {
    this.openAIKey = process.env.OPENAI_API_KEY;
    this.geminiKey = process.env.GOOGLE_AI_API_KEY;
  }

  /**
   * Analyze user learning patterns and create personalized recommendations
   */
  async analyzeLearningPatterns(userId) {
    try {
      const user = await User.findById(userId);
      
      // Get comprehensive learning data
      const [sessions, courses, homework, gamification] = await Promise.all([
        PeerSession.find({ 'participants.user': userId }),
        LectureCourse.find({ 'enrolledStudents.user': userId }),
        HomeworkSession.find({ user: userId }),
        UserGamification.findOne({ user: userId })
      ]);

      // Calculate metrics
      const metrics = this.calculateMetrics(sessions, courses, homework, gamification);
      
      // Generate personalized insights with AI
      const insights = await this.generateInsights(user, metrics);
      
      return {
        metrics,
        insights,
        recommendations: await this.generateRecommendations(userId, metrics, insights)
      };
    } catch (error) {
      console.error('Error analyzing learning patterns:', error);
      throw error;
    }
  }

  /**
   * Calculate learning metrics
   */
  calculateMetrics(sessions, courses, homework, gamification) {
    const subjectFrequency = {};
    const timeOfDayActivity = {};
    const dailyActivity = {};
    const completionRates = {};
    
    sessions.forEach(session => {
      // Subject frequency
      subjectFrequency[session.subject] = (subjectFrequency[session.subject] || 0) + 1;
      
      // Time of day patterns
      const hour = new Date(session.createdAt).getHours();
      timeOfDayActivity[hour] = (timeOfDayActivity[hour] || 0) + 1;
      
      // Daily activity
      const day = new Date(session.createdAt).toISOString().split('T')[0];
      dailyActivity[day] = (dailyActivity[day] || 0) + 1;
    });

    return {
      totalSessions: sessions.length,
      subjectsStudied: Object.keys(subjectFrequency),
      subjectFrequency,
      timeOfDayActivity,
      dailyActivity,
      streak: gamification?.streaks?.current || 0,
      level: gamification?.level?.current || 1,
      points: gamification?.points?.lifetime || 0,
      averageSessionDuration: sessions.length > 0 
        ? sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.length
        : 0,
      preferredSubjects: Object.entries(subjectFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([subject]) => subject),
      peakLearningHours: Object.entries(timeOfDayActivity)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([hour]) => parseInt(hour)),
      weakAreas: this.identifyWeakAreas(sessions, homework)
    };
  }

  /**
   * Identify weak areas based on session ratings and homework difficulty
   */
  identifyWeakAreas(sessions, homework) {
    const subjectRatings = {};
    const subjectCounts = {};
    
    sessions.forEach(session => {
      if (session.rating) {
        subjectRatings[session.subject] = (subjectRatings[session.subject] || 0) + session.rating;
        subjectCounts[session.subject] = (subjectCounts[session.subject] || 0) + 1;
      }
    });

    const weakAreas = [];
    Object.entries(subjectRatings).forEach(([subject, total]) => {
      const avg = total / subjectCounts[subject];
      if (avg < 3.5) {
        weakAreas.push(subject);
      }
    });

    return weakAreas;
  }

  /**
   * Generate AI-powered insights
   */
  async generateInsights(user, metrics) {
    const prompt = `Analyze this student's learning patterns and provide personalized insights:

Student Profile:
- Name: ${user.name}
- Grade: ${user.profile?.grade || 'Not specified'}
- Subjects of interest: ${user.profile?.subjects?.join(', ') || 'Not specified'}

Learning Metrics:
- Total sessions: ${metrics.totalSessions}
- Current streak: ${metrics.streak} days
- Level: ${metrics.level}
- Preferred subjects: ${metrics.preferredSubjects.join(', ')}
- Peak learning hours: ${metrics.peakLearningHours.join(':00, ')}:00
- Weak areas: ${metrics.weakAreas.join(', ') || 'None identified'}
- Average session: ${(metrics.averageSessionDuration / 60).toFixed(1)} minutes

Provide insights in this JSON format:
{
  "learningStyle": "visual/auditory/kinesthetic/mixed",
  "strengths": ["strength1", "strength2"],
  "areasForImprovement": ["area1", "area2"],
  "studyRecommendations": ["recommendation1", "recommendation2"],
  "optimalSchedule": {
    "bestDays": ["Monday", "Wednesday", "Friday"],
    "bestTime": "16:00-18:00",
    "sessionLength": "45 minutes"
  },
  "motivationTips": ["tip1", "tip2"]
}`;

    try {
      const aiResponse = await this.callAI(prompt);
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return this.generateBasicInsights(metrics);
    } catch (error) {
      console.error('AI insights error:', error);
      return this.generateBasicInsights(metrics);
    }
  }

  /**
   * Generate basic insights without AI
   */
  generateBasicInsights(metrics) {
    const insights = {
      learningStyle: 'mixed',
      strengths: metrics.preferredSubjects.length > 0 
        ? [`Strong in ${metrics.preferredSubjects[0]}`, 'Consistent learner']
        : ['Regular learner'],
      areasForImprovement: metrics.weakAreas.length > 0
        ? metrics.weakAreas.map(s => `Improve ${s}`)
        : ['Explore new subjects'],
      studyRecommendations: [
        `Study during peak hours: ${metrics.peakLearningHours[0]}:00`,
        'Take 5-minute breaks every 25 minutes',
        'Review weak areas twice weekly'
      ],
      optimalSchedule: {
        bestDays: ['Monday', 'Wednesday', 'Friday'],
        bestTime: `${metrics.peakLearningHours[0] || 16}:00-${(metrics.peakLearningHours[0] || 16) + 2}:00`,
        sessionLength: '45 minutes'
      },
      motivationTips: [
        'Track your daily streak',
        'Set small achievable goals',
        'Celebrate your progress'
      ]
    };

    return insights;
  }

  /**
   * Generate personalized course and tutor recommendations
   */
  async generateRecommendations(userId, metrics, insights) {
    try {
      // Get available courses
      const availableCourses = await LectureCourse.find({
        status: 'published',
        subject: { $in: [...metrics.preferredSubjects, ...metrics.weakAreas] }
      }).limit(10);

      // Get available tutors
      const availableTutors = await User.find({
        role: 'tutor',
        'profile.subjects': { $in: metrics.weakAreas.length > 0 ? metrics.weakAreas : metrics.preferredSubjects }
      }).select('name profile rating').limit(5);

      // AI-powered recommendation ranking
      const rankedRecommendations = await this.rankRecommendations(
        availableCourses,
        availableTutors,
        metrics,
        insights
      );

      return {
        courses: rankedRecommendations.courses.slice(0, 5),
        tutors: rankedRecommendations.tutors.slice(0, 3),
        studyPlan: this.generateStudyPlan(metrics, insights),
        nextSteps: [
          `Focus on ${metrics.weakAreas[0] || metrics.preferredSubjects[0]} this week`,
          'Schedule 3 sessions at your peak learning time',
          'Try a new study technique'
        ]
      };
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw error;
    }
  }

  /**
   * Rank recommendations using AI
   */
  async rankRecommendations(courses, tutors, metrics, insights) {
    // Simple ranking algorithm
    const rankedCourses = courses.map(course => {
      let score = 0;
      
      // Boost weak areas
      if (metrics.weakAreas.includes(course.subject)) {
        score += 10;
      }
      
      // Boost preferred subjects
      if (metrics.preferredSubjects.includes(course.subject)) {
        score += 5;
      }
      
      // Consider ratings
      score += (course.stats?.averageRating || 3) * 2;
      
      // Consider popularity
      score += Math.min(course.stats?.totalEnrollments || 0, 50) / 10;
      
      return { ...course.toObject(), relevanceScore: score };
    }).sort((a, b) => b.relevanceScore - a.relevanceScore);

    const rankedTutors = tutors.map(tutor => {
      let score = 0;
      
      // Match subjects
      const matchingSubjects = tutor.profile?.subjects?.filter(s => 
        metrics.weakAreas.includes(s) || metrics.preferredSubjects.includes(s)
      ) || [];
      
      score += matchingSubjects.length * 5;
      score += (tutor.profile?.rating || 3) * 2;
      
      return { ...tutor.toObject(), relevanceScore: score };
    }).sort((a, b) => b.relevanceScore - a.relevanceScore);

    return { courses: rankedCourses, tutors: rankedTutors };
  }

  /**
   * Generate personalized study plan
   */
  generateStudyPlan(metrics, insights) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const plan = [];
    
    // Create a weekly schedule
    days.forEach((day, index) => {
      if (index < 5) { // Weekdays
        plan.push({
          day,
          sessions: [
            {
              subject: index % 2 === 0 ? metrics.preferredSubjects[0] : (metrics.weakAreas[0] || metrics.preferredSubjects[1]),
              duration: insights.optimalSchedule?.sessionLength || '45 minutes',
              time: insights.optimalSchedule?.bestTime?.split('-')[0] || '16:00',
              type: index % 2 === 0 ? 'practice' : 'learning',
              focus: index % 2 === 0 ? 'strengths' : 'improvement'
            }
          ],
          goals: [
            `Complete 1 ${index % 2 === 0 ? 'practice' : 'learning'} session`,
            'Review notes from previous session'
          ]
        });
      } else {
        // Weekend - lighter schedule
        plan.push({
          day,
          sessions: [
            {
              subject: 'review',
              duration: '30 minutes',
              time: '10:00',
              type: 'review',
              focus: 'consolidation'
            }
          ],
          goals: ['Review week\'s learning', 'Plan next week']
        });
      }
    });

    return plan;
  }

  /**
   * Generate adaptive learning path
   */
  async generateLearningPath(userId, targetSubject, targetLevel) {
    const user = await User.findById(userId);
    const currentProgress = await this.analyzeLearningPatterns(userId);
    
    const prompt = `Create an adaptive learning path for:

Student: ${user.name}
Target Subject: ${targetSubject}
Target Level: ${targetLevel}
Current Level: ${currentProgress.metrics.level}
Strong Subjects: ${currentProgress.metrics.preferredSubjects.join(', ')}
Weak Areas: ${currentProgress.metrics.weakAreas.join(', ')}

Create a structured learning path with:
1. Prerequisites needed
2. Milestones/stages
3. Recommended resources
4. Estimated time per stage
5. Assessment points

Format as JSON with these sections.`;

    try {
      const content = await this.callAI(prompt);
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return this.generateDefaultLearningPath(targetSubject, targetLevel);
    } catch (error) {
      console.error('Learning path generation error:', error);
      return this.generateDefaultLearningPath(targetSubject, targetLevel);
    }
  }

  generateDefaultLearningPath(subject, level) {
    return {
      subject,
      targetLevel: level,
      stages: [
        {
          name: 'Foundation',
          duration: '2 weeks',
          topics: ['Basic concepts', 'Core principles', 'Introduction'],
          assessments: ['Quiz 1', 'Practice problems']
        },
        {
          name: 'Intermediate',
          duration: '3 weeks',
          topics: ['Advanced concepts', 'Problem solving', 'Applications'],
          assessments: ['Mid-term', 'Project 1']
        },
        {
          name: 'Advanced',
          duration: '2 weeks',
          topics: ['Complex problems', 'Real-world applications', 'Mastery'],
          assessments: ['Final exam', 'Capstone project']
        }
      ],
      totalDuration: '7 weeks',
      recommendedResources: [
        'Textbook: ' + subject + ' Fundamentals',
        'Online course: ' + subject + ' Mastery',
        'Practice problem sets'
      ]
    };
  }

  /**
   * Predict learning outcomes
   */
  async predictOutcomes(userId, studyPlan) {
    const metrics = await this.analyzeLearningPatterns(userId);
    
    // Simple prediction based on historical data
    const currentStreak = metrics.metrics.streak;
    const completionRate = metrics.metrics.totalSessions > 0
      ? (metrics.metrics.totalSessions / 30) * 100 // Assuming monthly goal
      : 0;
    
    const predictedScore = Math.min(
      95,
      50 + (currentStreak * 2) + (completionRate * 0.3)
    );

    const successProbability = Math.min(
      100,
      60 + (currentStreak * 3) + (metrics.metrics.level * 2)
    );

    return {
      predictedScore: predictedScore.toFixed(1),
      successProbability: successProbability.toFixed(1),
      estimatedCompletion: this.estimateCompletion(metrics.metrics, studyPlan),
      riskFactors: this.identifyRiskFactors(metrics.metrics),
      recommendations: this.generateImprovementRecommendations(metrics.metrics)
    };
  }

  estimateCompletion(metrics, studyPlan) {
    const totalHours = studyPlan.reduce((sum, day) => 
      sum + day.sessions.reduce((s, session) => s + parseInt(session.duration), 0), 0
    );
    
    const weeklyHours = totalHours / 7;
    const learningRate = metrics.averageSessionDuration > 0 ? 1 : 0.8;
    
    return {
      weeks: Math.ceil(weeklyHours / (learningRate * 5)),
      totalHours: totalHours,
      confidence: metrics.streak > 7 ? 'high' : metrics.streak > 3 ? 'medium' : 'low'
    };
  }

  identifyRiskFactors(metrics) {
    const risks = [];
    
    if (metrics.streak === 0) {
      risks.push({ type: 'engagement', severity: 'high', message: 'No recent activity' });
    } else if (metrics.streak < 3) {
      risks.push({ type: 'consistency', severity: 'medium', message: 'Inconsistent study habits' });
    }
    
    if (metrics.weakAreas.length > 2) {
      risks.push({ type: 'performance', severity: 'medium', message: 'Multiple weak subjects' });
    }
    
    if (metrics.averageSessionDuration < 20) {
      risks.push({ type: 'duration', severity: 'low', message: 'Short study sessions' });
    }
    
    return risks;
  }

  generateImprovementRecommendations(metrics) {
    const recommendations = [];
    
    if (metrics.streak < 3) {
      recommendations.push('Set daily reminders to maintain consistency');
    }
    
    if (metrics.weakAreas.length > 0) {
      recommendations.push(`Schedule extra time for ${metrics.weakAreas[0]}`);
    }
    
    if (metrics.averageSessionDuration < 30) {
      recommendations.push('Try longer study sessions (45-60 minutes)');
    }
    
    return recommendations;
  }

  /**
   * Universal AI Wrapper (Gemini Priority)
   */
  async callAI(prompt) {
    if (this.geminiKey) {
      return await this.callGemini(prompt);
    }
    if (this.openAIKey) {
      return await this.callOpenAI(prompt);
    }
    throw new Error('No AI provider configured');
  }

  async callGemini(prompt) {
    const model = 'gemini-flash-latest';
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.geminiKey}`;
    try {
      const response = await axios.post(geminiUrl, {
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });
      return response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (error) {
      console.warn(`[Personalization] Gemini failed: ${error.message}`);
      throw error;
    }
  }

  async callOpenAI(prompt) {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${this.openAIKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.choices[0].message.content;
  }
}

module.exports = new AIPersonalizationService();
