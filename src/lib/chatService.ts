import { v4 as uuidv4 } from 'uuid';
import { N8nWebhookPayload, N8nWebhookResponse, N8nWebhookArrayResponse } from '@/types/chat';

class ChatService {
  private sessionId: string;
  private webhookUrl: string;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.webhookUrl = process.env.NEXT_PUBLIC_CHAT_WEBHOOK_URL || '';
  }

  private getOrCreateSessionId(): string {
    if (typeof window !== 'undefined') {
      let sessionId = localStorage.getItem('surf-chat-session-id');
      if (!sessionId) {
        sessionId = uuidv4();
        localStorage.setItem('surf-chat-session-id', sessionId);
      }
      return sessionId;
    }
    return uuidv4();
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  public async sendMessage(message: string): Promise<string> {
    if (!this.webhookUrl) {
      throw new Error('Chat webhook URL not configured');
    }

    const payload: N8nWebhookPayload = {
      sessionId: this.sessionId,
      message: message.trim(),
      timestamp: new Date().toISOString(),
    };

    try {
      // SECURITY: Removed webhook URL and payload logging - exposes system configuration and user data

      // Create basic auth header - try both client and server env vars
      const username = process.env.NEXT_PUBLIC_N8N_WEBHOOK_USERNAME || process.env.N8N_WEBHOOK_USERNAME;
      const password = process.env.NEXT_PUBLIC_N8N_WEBHOOK_PASSWORD || process.env.N8N_WEBHOOK_PASSWORD;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Add basic auth if credentials are available
      if (username && password) {
        const basicAuth = Buffer.from(`${username}:${password}`).toString('base64');
        headers['Authorization'] = `Basic ${basicAuth}`;
      }

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Debug logging to see what the webhook is returning
      // SECURITY: Removed webhook response logging - may contain sensitive data
      
      // Handle array response format: [{"output": "response text"}]
      let aiResponse: string | undefined;
      
      if (Array.isArray(data)) {
        // Extract from array format: [{"output": "response"}]
        const firstItem = data[0];
        if (firstItem && typeof firstItem === 'object') {
          aiResponse = firstItem.output || firstItem.response;
        }
      } else if (typeof data === 'object' && data !== null) {
        // Handle single object format: {"output": "response"} or {"response": "response"}
        aiResponse = data.output || data.response;
      }
      
      return aiResponse || 'Sorry, I didn\'t understand that. Could you please rephrase?';
    } catch (error) {
      console.error('Error sending message to chat webhook:', error);
      throw new Error('Failed to send message. Please try again.');
    }
  }

  public resetSession(): void {
    this.sessionId = uuidv4();
    if (typeof window !== 'undefined') {
      localStorage.setItem('surf-chat-session-id', this.sessionId);
    }
  }
}

export const chatService = new ChatService(); 