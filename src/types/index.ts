export interface AgentConfig {
  environmentId: string;
  agentId: string;
  tenantId: string;
  clientId: string;
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface CopilotStudioResponse {
  content: string;
  conversationId?: string;
}

export interface ShowValuesState {
  environmentId: boolean;
  agentId: boolean;
  tenantId: boolean;
  clientId: boolean;
}

export interface StatusMessage {
  type: 'success' | 'error' | 'info';
  message: string;
}