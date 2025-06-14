export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface ChatSession {
  sessionId: string;
  messages: ChatMessage[];
}

export interface N8nWebhookPayload {
  sessionId: string;
  message: string;
  timestamp: string;
}

// Updated to handle array response format: [{"output": "response text"}]
export interface N8nWebhookResponse {
  response?: string;
  output?: string;  // Support both response and output fields
  sessionId?: string; // Optional since we don't actually need it back
}

// For array responses from the webhook
export type N8nWebhookArrayResponse = N8nWebhookResponse[]; 