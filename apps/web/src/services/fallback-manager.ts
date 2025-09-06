import { DatabaseService } from './database';
import { FallbackDeck, Presentation } from '@speakdeck/shared';

export class FallbackManager {
  private db: DatabaseService;

  constructor() {
    this.db = new DatabaseService();
  }

  async getFallbackPresentation(topic: string): Promise<Presentation> {
    // Try to find a relevant fallback deck
    const fallbackDecks = await this.db.getFallbackDecks(topic);
    
    let selectedDeck: FallbackDeck;
    
    if (fallbackDecks.length === 0) {
      // No fallback decks found, create a generic one
      selectedDeck = this.createGenericFallbackDeck(topic);
    } else {
      // Select the least used fallback deck
      selectedDeck = fallbackDecks[0];
      
      // Increment usage count
      try {
        await this.db.incrementFallbackUsage(selectedDeck.id);
      } catch (error) {
        console.error('Failed to increment fallback usage:', error);
      }
    }

    // Convert fallback deck to presentation format
    return this.convertFallbackToPresentation(selectedDeck);
  }

  private createGenericFallbackDeck(topic: string): FallbackDeck {
    const slides = [
      {
        slideNumber: 1,
        title: `Introduction to ${topic}`,
        content: `Welcome to this presentation about ${topic}. We'll explore the key concepts and insights in this area.`,
        imageUrl: 'https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=Introduction',
        audioUrl: '', // Would be generated or pre-recorded
      },
      {
        slideNumber: 2,
        title: 'Key Concepts',
        content: `Let's dive into the fundamental concepts that make ${topic} important and relevant in today's context.`,
        imageUrl: 'https://via.placeholder.com/800x600/059669/FFFFFF?text=Key+Concepts',
        audioUrl: '',
      },
      {
        slideNumber: 3,
        title: 'Applications and Examples',
        content: `Here are some practical applications and real-world examples of ${topic} that demonstrate its value.`,
        imageUrl: 'https://via.placeholder.com/800x600/DC2626/FFFFFF?text=Applications',
        audioUrl: '',
      },
      {
        slideNumber: 4,
        title: 'Conclusion',
        content: `To conclude, ${topic} represents an important area with significant potential for future development and applications.`,
        imageUrl: 'https://via.placeholder.com/800x600/D97706/FFFFFF?text=Conclusion',
        audioUrl: '',
      },
    ];

    return {
      id: crypto.randomUUID(),
      topic: this.categorizeTopicGeneric(topic),
      title: `${topic} - Overview`,
      slides,
      isActive: true,
      usageCount: 0,
      createdAt: new Date(),
    };
  }

  private convertFallbackToPresentation(fallbackDeck: FallbackDeck): Presentation {
    const presentationId = crypto.randomUUID();
    const now = new Date();

    const slides = fallbackDeck.slides.map(fallbackSlide => ({
      id: crypto.randomUUID(),
      presentationId: presentationId,
      slideNumber: fallbackSlide.slideNumber,
      title: fallbackSlide.title,
      content: fallbackSlide.content,
      imageUrl: fallbackSlide.imageUrl,
      audioUrl: fallbackSlide.audioUrl,
      generationStatus: {
        text: 'completed' as const,
        image: 'completed' as const,
        audio: fallbackSlide.audioUrl ? 'completed' as const : 'failed' as const,
      },
      aiPrompts: {
        imagePrompt: `Visual representation of: ${fallbackSlide.title}`,
        audioScript: fallbackSlide.content,
      },
      createdAt: now,
      updatedAt: now,
    }));

    return {
      id: presentationId,
      title: fallbackDeck.title,
      status: 'completed',
      createdAt: now,
      updatedAt: now,
      userId: undefined,
      slides,
      totalSlides: slides.length,
      generationTimeMs: 0, // Instant for fallback
      errorMessage: undefined,
      metadata: {
        // Mark as fallback for transparency
        isFallback: true,
        fallbackDeckId: fallbackDeck.id,
        fallbackReason: 'API quota exceeded',
      },
    };
  }

  private categorizeTopicGeneric(topic: string): string {
    const topicLower = topic.toLowerCase();
    
    // Simple keyword matching for categorization
    if (topicLower.includes('tech') || topicLower.includes('ai') || topicLower.includes('software') || topicLower.includes('computer')) {
      return 'Technology';
    }
    
    if (topicLower.includes('business') || topicLower.includes('market') || topicLower.includes('startup') || topicLower.includes('entrepreneur')) {
      return 'Business';
    }
    
    if (topicLower.includes('education') || topicLower.includes('learn') || topicLower.includes('school') || topicLower.includes('university')) {
      return 'Education';
    }
    
    if (topicLower.includes('science') || topicLower.includes('research') || topicLower.includes('study')) {
      return 'Science';
    }
    
    if (topicLower.includes('health') || topicLower.includes('medical') || topicLower.includes('wellness')) {
      return 'Health';
    }
    
    if (topicLower.includes('environment') || topicLower.includes('climate') || topicLower.includes('sustainability')) {
      return 'Environment';
    }
    
    if (topicLower.includes('art') || topicLower.includes('design') || topicLower.includes('creative')) {
      return 'Arts';
    }
    
    if (topicLower.includes('history') || topicLower.includes('past') || topicLower.includes('historical')) {
      return 'History';
    }
    
    // Default category
    return 'General';
  }

  async checkApiQuotas(): Promise<{ hasQuotaAvailable: boolean; limitedServices: string[] }> {
    // For development, always allow AI generation unless explicitly disabled
    // In production, this would check actual API quotas
    const forceUseFallback = process.env.FORCE_USE_FALLBACK === 'true';
    
    if (forceUseFallback) {
      console.log('Force fallback is enabled via environment variable');
      return {
        hasQuotaAvailable: false,
        limitedServices: ['gemini', 'nanoBanana'],
      };
    }
    
    // For development/testing, assume quotas are available
    // This allows us to test the actual AI services
    console.log('API quotas check: All services available for development');
    return {
      hasQuotaAvailable: true,
      limitedServices: [],
    };
  }

  async shouldUseFallback(topic: string): Promise<{ useFallback: boolean; reason?: string }> {
    const quotaStatus = await this.checkApiQuotas();
    
    if (!quotaStatus.hasQuotaAvailable) {
      return {
        useFallback: true,
        reason: `API quota exceeded for services: ${quotaStatus.limitedServices.join(', ')}`,
      };
    }

    // Check for other conditions that might trigger fallback
    // e.g., service availability, response time, etc.
    
    return { useFallback: false };
  }

  async createDefaultFallbackDecks(): Promise<void> {
    // This method would be used to seed the database with default fallback decks
    const defaultDecks = [
      this.createTechnologyFallbackDeck(),
      this.createBusinessFallbackDeck(),
      this.createEducationFallbackDeck(),
    ];

    // In a real implementation, you'd insert these into the database
    console.log('Default fallback decks created:', defaultDecks.length);
  }

  private createTechnologyFallbackDeck(): FallbackDeck {
    return {
      id: crypto.randomUUID(),
      topic: 'Technology',
      title: 'Technology Overview',
      slides: [
        {
          slideNumber: 1,
          title: 'Introduction to Technology',
          content: 'Technology shapes our world in countless ways, from the devices we use daily to the systems that power our economy.',
          imageUrl: 'https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=Technology',
          audioUrl: '',
        },
        {
          slideNumber: 2,
          title: 'Digital Transformation',
          content: 'Organizations worldwide are embracing digital transformation to stay competitive and meet evolving customer expectations.',
          imageUrl: 'https://via.placeholder.com/800x600/059669/FFFFFF?text=Digital+Transformation',
          audioUrl: '',
        },
        {
          slideNumber: 3,
          title: 'Innovation and Impact',
          content: 'Technological innovation continues to drive progress, creating new opportunities and solving complex challenges.',
          imageUrl: 'https://via.placeholder.com/800x600/DC2626/FFFFFF?text=Innovation',
          audioUrl: '',
        },
        {
          slideNumber: 4,
          title: 'Future Outlook',
          content: 'The future of technology holds immense potential, with emerging trends that will reshape how we live and work.',
          imageUrl: 'https://via.placeholder.com/800x600/D97706/FFFFFF?text=Future',
          audioUrl: '',
        },
      ],
      isActive: true,
      usageCount: 0,
      createdAt: new Date(),
    };
  }

  private createBusinessFallbackDeck(): FallbackDeck {
    return {
      id: crypto.randomUUID(),
      topic: 'Business',
      title: 'Business Fundamentals',
      slides: [
        {
          slideNumber: 1,
          title: 'Business Strategy',
          content: 'Successful businesses are built on solid strategies that align resources with market opportunities and customer needs.',
          imageUrl: 'https://via.placeholder.com/800x600/7C3AED/FFFFFF?text=Strategy',
          audioUrl: '',
        },
        {
          slideNumber: 2,
          title: 'Market Analysis',
          content: 'Understanding your market is crucial for making informed decisions and identifying growth opportunities.',
          imageUrl: 'https://via.placeholder.com/800x600/059669/FFFFFF?text=Market+Analysis',
          audioUrl: '',
        },
        {
          slideNumber: 3,
          title: 'Execution Excellence',
          content: 'Great strategies must be backed by excellent execution to achieve sustainable business success.',
          imageUrl: 'https://via.placeholder.com/800x600/DC2626/FFFFFF?text=Execution',
          audioUrl: '',
        },
        {
          slideNumber: 4,
          title: 'Growth and Scale',
          content: 'Scaling a business requires careful planning, resource allocation, and continuous adaptation to market changes.',
          imageUrl: 'https://via.placeholder.com/800x600/D97706/FFFFFF?text=Growth',
          audioUrl: '',
        },
      ],
      isActive: true,
      usageCount: 0,
      createdAt: new Date(),
    };
  }

  private createEducationFallbackDeck(): FallbackDeck {
    return {
      id: crypto.randomUUID(),
      topic: 'Education',
      title: 'Education and Learning',
      slides: [
        {
          slideNumber: 1,
          title: 'The Learning Process',
          content: 'Learning is a continuous journey that involves acquiring knowledge, developing skills, and applying insights.',
          imageUrl: 'https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=Learning',
          audioUrl: '',
        },
        {
          slideNumber: 2,
          title: 'Modern Education Methods',
          content: 'Contemporary education embraces diverse teaching methods, technology integration, and personalized learning approaches.',
          imageUrl: 'https://via.placeholder.com/800x600/059669/FFFFFF?text=Modern+Education',
          audioUrl: '',
        },
        {
          slideNumber: 3,
          title: 'Skills Development',
          content: 'Focus on developing both hard and soft skills prepares learners for success in an ever-changing world.',
          imageUrl: 'https://via.placeholder.com/800x600/DC2626/FFFFFF?text=Skills',
          audioUrl: '',
        },
        {
          slideNumber: 4,
          title: 'Lifelong Learning',
          content: 'In today\'s rapidly evolving landscape, lifelong learning has become essential for personal and professional growth.',
          imageUrl: 'https://via.placeholder.com/800x600/D97706/FFFFFF?text=Lifelong+Learning',
          audioUrl: '',
        },
      ],
      isActive: true,
      usageCount: 0,
      createdAt: new Date(),
    };
  }
}
