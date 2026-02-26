const Badge = require('../models/Badge');

class BadgeInitializationService {
  // Initialize the specific badges from requirements
  static async initializeRequiredBadges() {
    try {
      const requiredBadges = [
        // "First Question" → 1 question posted (global)
        {
          name: 'First Question',
          description: 'Posted your first question',
          icon: '❓',
          category: 'milestone',
          criteria: { 
            type: 'questions', 
            value: 1, 
            subject: 'all' 
          },
          pointsAwarded: 0,
          rarity: 'common',
          tier: 1,
          oneTime: true
        },
        
        // "Curious Mind" → 5 questions posted (global)
        {
          name: 'Curious Mind',
          description: 'Posted 5 questions',
          icon: '🤔',
          category: 'milestone',
          criteria: { 
            type: 'questions', 
            value: 5, 
            subject: 'all' 
          },
          pointsAwarded: 10,
          rarity: 'uncommon',
          tier: 2,
          oneTime: true
        },
        
        // "{Subject} Contributor" → 50 points in one subject
        {
          name: 'Mathematics Contributor',
          description: 'Earned 50 points in Mathematics',
          icon: '🧮',
          category: 'subject_mastery',
          criteria: { 
            type: 'points', 
            value: 50, 
            subject: 'Mathematics' 
          },
          pointsAwarded: 25,
          rarity: 'uncommon',
          tier: 2,
          oneTime: true
        },
        {
          name: 'Physics Contributor',
          description: 'Earned 50 points in Physics',
          icon: '⚛️',
          category: 'subject_mastery',
          criteria: { 
            type: 'points', 
            value: 50, 
            subject: 'Physics' 
          },
          pointsAwarded: 25,
          rarity: 'uncommon',
          tier: 2,
          oneTime: true
        },
        {
          name: 'Chemistry Contributor',
          description: 'Earned 50 points in Chemistry',
          icon: '🧪',
          category: 'subject_mastery',
          criteria: { 
            type: 'points', 
            value: 50, 
            subject: 'Chemistry' 
          },
          pointsAwarded: 25,
          rarity: 'uncommon',
          tier: 2,
          oneTime: true
        },
        {
          name: 'Biology Contributor',
          description: 'Earned 50 points in Biology',
          icon: '🧬',
          category: 'subject_mastery',
          criteria: { 
            type: 'points', 
            value: 50, 
            subject: 'Biology' 
          },
          pointsAwarded: 25,
          rarity: 'uncommon',
          tier: 2,
          oneTime: true
        },
        {
          name: 'Computer Science Contributor',
          description: 'Earned 50 points in Computer Science',
          icon: '💻',
          category: 'subject_mastery',
          criteria: { 
            type: 'points', 
            value: 50, 
            subject: 'Computer Science' 
          },
          pointsAwarded: 25,
          rarity: 'uncommon',
          tier: 2,
          oneTime: true
        },
        
        // "Rising Star" → total reputation ≥ 100 (global)
        {
          name: 'Rising Star',
          description: 'Reached 100 reputation points',
          icon: '⭐',
          category: 'milestone',
          criteria: { 
            type: 'points', 
            value: 100, 
            subject: 'all' 
          },
          pointsAwarded: 50,
          rarity: 'rare',
          tier: 3,
          oneTime: true
        },
        
        // "Superstar" → total reputation ≥ 500 (global)
        {
          name: 'Superstar',
          description: 'Reached 500 reputation points',
          icon: '🌟',
          category: 'milestone',
          criteria: { 
            type: 'points', 
            value: 500, 
            subject: 'all' 
          },
          pointsAwarded: 100,
          rarity: 'epic',
          tier: 4,
          oneTime: true
        }
      ];

      const createdBadges = [];
      
      for (const badgeData of requiredBadges) {
        // Check if badge already exists
        const existingBadge = await Badge.findOne({ name: badgeData.name });
        
        if (!existingBadge) {
          const badge = new Badge(badgeData);
          await badge.save();
          createdBadges.push(badge);
          console.log(`Created badge: ${badge.name}`);
        } else {
          console.log(`Badge already exists: ${badgeData.name}`);
        }
      }

      return createdBadges;
    } catch (error) {
      console.error('Error initializing required badges:', error);
      throw error;
    }
  }

  // Get all required badge names for reference
  static getRequiredBadgeNames() {
    return [
      'First Question',
      'Curious Mind',
      'Mathematics Contributor',
      'Physics Contributor', 
      'Chemistry Contributor',
      'Biology Contributor',
      'Computer Science Contributor',
      'Rising Star',
      'Superstar'
    ];
  }
}

module.exports = BadgeInitializationService;
