// services/aiService.js - AI Service for Collaboration Matching and Outreach
const axios = require('axios');

class AIService {
  constructor() {
    this.anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    this.openaiApiKey = process.env.OPENAI_API_KEY;

    // Use Anthropic Claude by default, fallback to OpenAI
    this.provider = this.anthropicApiKey ? 'anthropic' : 'openai';
  }

  /**
   * Generate personalized outreach message for a potential collaborator
   */
  async generateOutreachMessage(currentUser, targetCreator, collaborationFormats) {
    const prompt = `You are an expert at creating personalized, genuine collaboration outreach messages for content creators.

Current User Profile:
- Name: ${currentUser.name || 'A local creator'}
- Location: ${currentUser.city}, ${currentUser.state}
- Platform: ${targetCreator.platform}

Target Creator Profile:
- Name: ${targetCreator.displayName}
- Username: @${targetCreator.username}
- Platform: ${targetCreator.platform}
- Followers: ${targetCreator.followers?.toLocaleString()}
- Engagement Rate: ${targetCreator.engagement}%
- Recent Topics: ${targetCreator.recentTopics?.join(', ') || 'content creation'}
- Location: ${targetCreator.distance ? `${targetCreator.distance.toFixed(1)} miles away` : 'local area'}

Suggested Collaboration Formats:
${collaborationFormats.map((format, idx) => `${idx + 1}. ${format.type}: ${format.description}`).join('\n')}

Write a warm, personalized outreach message (150-200 words) that:
1. Shows genuine interest in their content (reference their topics)
2. Highlights geographic proximity as a collaboration opportunity
3. Mentions 1-2 specific collaboration ideas from the suggestions
4. Is conversational and authentic, not salesy
5. Ends with a clear but low-pressure call to action

Keep it friendly and professional. Do NOT use excessive emojis.`;

    try {
      const message = await this._callAI(prompt);
      return message;
    } catch (error) {
      console.error('AI outreach generation error:', error.message);
      // Fallback to template
      return this._generateTemplateOutreach(currentUser, targetCreator, collaborationFormats);
    }
  }

  /**
   * Analyze audience complementarity between two creators
   */
  async analyzeAudienceCompatibility(creator1, creator2) {
    const prompt = `Analyze the audience compatibility between these two content creators for potential collaboration:

Creator 1:
- Platform: ${creator1.platform}
- Followers: ${creator1.followers?.toLocaleString()}
- Engagement: ${creator1.engagement}%
- Topics: ${creator1.recentTopics?.join(', ') || 'general content'}

Creator 2:
- Platform: ${creator2.platform}
- Followers: ${creator2.followers?.toLocaleString()}
- Engagement: ${creator2.engagement}%
- Topics: ${creator2.recentTopics?.join(', ') || 'general content'}

Provide a JSON response with:
{
  "compatibilityScore": <0-100>,
  "topicOverlap": "<none|low|medium|high>",
  "audienceSizeCompatibility": "<very_different|somewhat_different|similar|very_similar>",
  "engagementCompatibility": "<very_different|somewhat_different|similar|very_similar>",
  "strengths": ["strength1", "strength2", "strength3"],
  "concerns": ["concern1", "concern2"],
  "recommendation": "<highly_recommended|recommended|possibly_beneficial|not_recommended>"
}

Return ONLY the JSON, no other text.`;

    try {
      const response = await this._callAI(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Invalid JSON response from AI');
    } catch (error) {
      console.error('Audience analysis error:', error.message);
      return this._calculateBasicCompatibility(creator1, creator2);
    }
  }

  /**
   * Suggest collaboration formats based on creator profiles
   */
  async suggestCollaborationFormats(creator1, creator2, distance) {
    const prompt = `Suggest creative collaboration formats for two content creators who want to work together:

Creator 1:
- Platform: ${creator1.platform}
- Followers: ${creator1.followers?.toLocaleString()}
- Topics: ${creator1.recentTopics?.join(', ') || 'content creation'}

Creator 2:
- Platform: ${creator2.platform}
- Followers: ${creator2.followers?.toLocaleString()}
- Topics: ${creator2.recentTopics?.join(', ') || 'content creation'}

Distance: ${distance ? `${distance.toFixed(1)} miles apart` : 'same area'}

Suggest 4-5 specific, actionable collaboration formats. Return as JSON array:
[
  {
    "type": "Collaboration Name",
    "description": "Brief description of what this involves",
    "effort": "low|medium|high",
    "impact": "low|medium|high",
    "inPerson": true|false
  }
]

Consider both IRL (in-person) and virtual collaboration options. Return ONLY the JSON array.`;

    try {
      const response = await this._callAI(prompt);
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Invalid JSON response from AI');
    } catch (error) {
      console.error('Collaboration format suggestion error:', error.message);
      return this._getDefaultCollaborationFormats(creator1, creator2, distance);
    }
  }

  /**
   * Call AI provider (Anthropic Claude or OpenAI)
   */
  async _callAI(prompt, maxTokens = 1000) {
    if (this.provider === 'anthropic' && this.anthropicApiKey) {
      return await this._callAnthropic(prompt, maxTokens);
    } else if (this.openaiApiKey) {
      return await this._callOpenAI(prompt, maxTokens);
    } else {
      throw new Error('No AI API key configured');
    }
  }

  async _callAnthropic(prompt, maxTokens) {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: maxTokens,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.anthropicApiKey,
          'anthropic-version': '2023-06-01'
        }
      }
    );

    return response.data.content[0].text;
  }

  async _callOpenAI(prompt, maxTokens) {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: maxTokens,
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`
        }
      }
    );

    return response.data.choices[0].message.content;
  }

  /**
   * Fallback template-based outreach
   */
  _generateTemplateOutreach(currentUser, targetCreator, collaborationFormats) {
    const topFormat = collaborationFormats[0] || { type: 'Content Collaboration', description: 'Create content together' };

    return `Hi ${targetCreator.displayName}! 👋

I'm ${currentUser.name || 'a content creator'} based in ${currentUser.city}, and I came across your ${targetCreator.platform} content. I really appreciate your approach to ${targetCreator.recentTopics?.[0] || 'content creation'}.

I noticed we're both in the same area, and I think there's great potential for us to collaborate. With your ${targetCreator.followers?.toLocaleString()} followers and ${targetCreator.engagement}% engagement rate, I believe our audiences would really benefit from working together.

I had a few ideas in mind, particularly around ${topFormat.type.toLowerCase()} – ${topFormat.description}

Would you be open to grabbing coffee or hopping on a quick call to explore this? I think we could create something really valuable for both our communities.

Looking forward to hearing from you!

Best,
${currentUser.name || '[Your Name]'}`;
  }

  /**
   * Basic compatibility calculation (fallback)
   */
  _calculateBasicCompatibility(creator1, creator2) {
    // Simple algorithm based on follower count similarity and engagement
    const followerRatio = Math.min(creator1.followers, creator2.followers) / Math.max(creator1.followers, creator2.followers);
    const engagementDiff = Math.abs(parseFloat(creator1.engagement) - parseFloat(creator2.engagement));

    const followerScore = followerRatio * 50; // Max 50 points
    const engagementScore = Math.max(0, 30 - engagementDiff); // Max 30 points
    const platformBonus = creator1.platform === creator2.platform ? 20 : 10;

    const compatibilityScore = Math.min(100, followerScore + engagementScore + platformBonus);

    return {
      compatibilityScore: Math.round(compatibilityScore),
      topicOverlap: 'medium',
      audienceSizeCompatibility: followerRatio > 0.5 ? 'similar' : 'somewhat_different',
      engagementCompatibility: engagementDiff < 2 ? 'similar' : 'somewhat_different',
      strengths: [
        'Geographic proximity enables in-person collaboration',
        'Similar engagement rates suggest compatible audiences',
        'Complementary content can provide value to both audiences'
      ],
      concerns: followerRatio < 0.3 ? ['Significant difference in audience size may affect collaboration dynamics'] : [],
      recommendation: compatibilityScore > 70 ? 'recommended' : 'possibly_beneficial'
    };
  }

  /**
   * Default collaboration formats (fallback)
   */
  _getDefaultCollaborationFormats(creator1, creator2, distance) {
    const isLocal = distance && distance < 30;

    const formats = [
      {
        type: 'Joint Content Series',
        description: 'Create a multi-part series where you each contribute content to a shared theme',
        effort: 'medium',
        impact: 'high',
        inPerson: false
      },
      {
        type: 'Cross-Promotion Campaign',
        description: 'Feature each other in your content with strategic shoutouts and collaborations',
        effort: 'low',
        impact: 'medium',
        inPerson: false
      }
    ];

    if (isLocal) {
      formats.unshift(
        {
          type: 'Local Meetup Event',
          description: 'Host a joint in-person event for your combined audiences',
          effort: 'high',
          impact: 'high',
          inPerson: true
        },
        {
          type: 'Behind-the-Scenes Collab',
          description: 'Film a day-in-the-life or behind-the-scenes content together',
          effort: 'medium',
          impact: 'high',
          inPerson: true
        }
      );
    }

    formats.push(
      {
        type: 'Guest Appearance',
        description: isLocal ? 'Appear in each other\'s content, either in-person or virtually' : 'Make virtual guest appearances in each other\'s content',
        effort: 'low',
        impact: 'medium',
        inPerson: isLocal
      },
      {
        type: 'Challenge or Giveaway',
        description: 'Run a collaborative challenge or giveaway to engage both audiences',
        effort: 'medium',
        impact: 'high',
        inPerson: false
      }
    );

    return formats;
  }
}

module.exports = new AIService();
