/**
 * Demo file showing how SpeakDeck's Nano Banana implementation
 * aligns with the official Google GenAI guide patterns
 */

import { NanoBananaService } from './nano-banana';

// Example usage patterns from the Nano Banana guide
export class NanoBananaDemoService {
  private nanoBanana: NanoBananaService;

  constructor(apiKey?: string) {
    this.nanoBanana = new NanoBananaService(apiKey);
  }

  // Pattern 1: Basic Image Generation (like guide example)
  async basicImageGeneration() {
    const prompt = "Create a photorealistic image of an orange cat with green eyes, sitting on a couch.";
    
    console.log("=== Basic Image Generation ===");
    const result = await this.nanoBanana.generateImage(prompt, 1);
    
    if (result.imageUrl.startsWith('data:')) {
      console.log("✅ Successfully generated image as base64 data URL");
      console.log(`Image data length: ${result.imageUrl.length}`);
      console.log(`API calls used: ${result.callsUsed}`);
    }
    
    return result;
  }

  // Pattern 2: Image Editing with existing image
  async imageEditingExample() {
    console.log("=== Image Editing Example ===");
    
    // First generate a base image
    const baseResult = await this.nanoBanana.generateImage(
      "A simple orange cat sitting on a white background", 
      1
    );
    
    if (baseResult.imageUrl.startsWith('data:')) {
      // Now edit that image
      const editPrompt = "Make the cat wear a funny party hat and add confetti in the background";
      const editedResult = await this.nanoBanana.editImage(
        baseResult.imageUrl, 
        editPrompt, 
        1
      );
      
      console.log("✅ Successfully edited image");
      console.log(`Total API calls: ${baseResult.callsUsed + editedResult.callsUsed}`);
      
      return editedResult;
    }
    
    return baseResult;
  }

  // Pattern 3: Multiple Image Processing (batch)
  async multipleImageGeneration() {
    console.log("=== Multiple Image Generation ===");
    
    const prompts = [
      "Professional presentation title slide with modern design",
      "Clean infographic showing business growth metrics",
      "Minimalist slide about team collaboration",
      "Conclusion slide with call-to-action elements"
    ];
    
    const results = await this.nanoBanana.generateMultipleImages(prompts);
    
    console.log(`✅ Generated ${results.length} images`);
    const totalCalls = results.reduce((sum, result) => sum + result.callsUsed, 0);
    console.log(`Total API calls used: ${totalCalls}`);
    
    return results;
  }

  // Pattern 4: Professional presentation image generation
  async presentationImageWorkflow() {
    console.log("=== Presentation Image Workflow ===");
    
    // Generate a professional slide image
    const slidePrompt = `
      Create a professional business presentation slide image about 
      'Digital Transformation in Modern Enterprises'. 
      Style: Clean, modern, corporate design with blue and white color scheme.
      Include: Abstract tech elements, network connections, digital icons.
      Layout: Leave space for text overlay, high contrast for readability.
    `;
    
    const result = await this.nanoBanana.generateImage(slidePrompt, 1);
    
    console.log("✅ Generated presentation slide image");
    console.log(`Suitable for professional use: ${result.imageUrl.length > 1000 ? 'Yes' : 'Placeholder used'}`);
    
    return result;
  }

  // Pattern 5: Error handling and fallback demonstration
  async errorHandlingDemo() {
    console.log("=== Error Handling Demo ===");
    
    try {
      // This might fail due to content policy or API issues
      const problematicPrompt = "Generate an image with extreme detail requirements that might exceed limits";
      
      const result = await this.nanoBanana.generateImage(problematicPrompt, 1);
      
      if (result.callsUsed === 0) {
        console.log("✅ Fallback system activated - placeholder image provided");
      } else {
        console.log("✅ Image generated successfully despite potential issues");
      }
      
      return result;
    } catch (error) {
      console.log("✅ Error handled gracefully:", error);
      throw error;
    }
  }

  // Pattern 6: Advanced image editing with URL support
  async advancedEditingDemo() {
    console.log("=== Advanced Image Editing Demo ===");
    
    // Generate base image
    const baseResult = await this.nanoBanana.generateImage(
      "A professional headshot placeholder for business cards", 
      1
    );
    
    if (baseResult.imageUrl && baseResult.callsUsed > 0) {
      // Use advanced editing method that can handle both data URLs and regular URLs
      const editPrompt = "Add a subtle blue background gradient and professional lighting";
      
      const editedResult = await this.nanoBanana.editImageAdvanced(
        baseResult.imageUrl,
        editPrompt,
        1
      );
      
      console.log("✅ Advanced image editing completed");
      return editedResult;
    }
    
    return baseResult;
  }

  // Utility method to demonstrate quota checking
  async checkServiceQuota() {
    console.log("=== Quota Status Check ===");
    
    const quota = await this.nanoBanana.checkQuota();
    console.log(`Quota remaining: ${quota.remaining}/${quota.total}`);
    
    return quota;
  }
}

// Example usage that matches the patterns from the official guide
export async function runNanoBananaDemo() {
  try {
    const demo = new NanoBananaDemoService();
    
    // Check quota first
    await demo.checkServiceQuota();
    
    // Run different demo patterns
    console.log("\n🚀 Starting Nano Banana demonstrations...\n");
    
    // Basic generation (matches guide pattern)
    await demo.basicImageGeneration();
    
    console.log("\n" + "=".repeat(50) + "\n");
    
    // Image editing (matches guide pattern)
    await demo.imageEditingExample();
    
    console.log("\n" + "=".repeat(50) + "\n");
    
    // Multiple images (enhanced from guide)
    await demo.multipleImageGeneration();
    
    console.log("\n✅ All demonstrations completed successfully!");
    
  } catch (error) {
    console.error("❌ Demo failed:", error);
  }
}

// Export for use in other parts of the application
export { NanoBananaDemoService };
