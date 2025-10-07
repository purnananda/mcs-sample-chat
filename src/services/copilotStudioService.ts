import {
  CopilotStudioClient,
  ConnectionSettings,
} from "@microsoft/agents-copilotstudio-client";
import { AgentConfig, CopilotStudioResponse } from '../types';

export class CopilotStudioService {
  private copilotClient: CopilotStudioClient | null = null;
  private config: AgentConfig;
  private conversationId: string | undefined;

  constructor(config: AgentConfig) {
    this.config = config;
  }

  /**
   * Initializes Copilot Studio client with access token and connection settings
   */
  private async initializeCopilotClient(accessToken: string): Promise<void> {
    try {
      console.log('Initializing Copilot Studio client with config:', {
        appClientId: this.config.clientId,
        tenantId: this.config.tenantId,
        environmentId: this.config.environmentId,
        agentIdentifier: this.config.agentId,
      });

      const connectionSettings: ConnectionSettings = {
        appClientId: this.config.clientId,
        tenantId: this.config.tenantId,
        environmentId: this.config.environmentId,
        agentIdentifier: this.config.agentId,
      };

      this.copilotClient = new CopilotStudioClient(
        connectionSettings,
        accessToken
      );
      
      console.log('Copilot Studio client initialized successfully');
    } catch (error: any) {
      console.error('Failed to initialize Copilot Studio Client:', error);
      throw new Error(
        `Failed to initialize Copilot Studio Client: ${error.message}`
      );
    }
  }

  /**
   * Start a new conversation with the bot
   */
  async startNewConversation(accessToken: string): Promise<CopilotStudioResponse> {
    if (!this.copilotClient) {
      await this.initializeCopilotClient(accessToken);
    }

    if (!this.copilotClient) {
      throw new Error('Failed to initialize Copilot Studio client');
    }

    try {
      const conversationActivity = await this.copilotClient.startConversationAsync();
      this.conversationId = conversationActivity.conversation?.id;

      return {
        content: conversationActivity.text || 'Hello! How can I help you today?',
        conversationId: this.conversationId,
      };
    } catch (error: any) {
      throw new Error(`Failed to start conversation: ${error.message}`);
    }
  }

  /**
   * Send a message to the bot
   */
  async sendMessage(message: string, accessToken: string): Promise<CopilotStudioResponse> {
    if (!this.copilotClient) {
      await this.initializeCopilotClient(accessToken);
    }

    if (!this.copilotClient) {
      throw new Error('Copilot Studio client not initialized');
    }

    try {
      const replies = await this.copilotClient.askQuestionAsync(message, this.conversationId);
      
      let responseText = '';
      
      replies.forEach((activity: any) => {
        if (activity.type === "message" && activity.text) {
          responseText += activity.text.trim() + ' ';
        }
      });

      return {
        content: responseText.trim() || 'I received your message but don\'t have a response.',
        conversationId: this.conversationId,
      };
    } catch (error: any) {
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  /**
   * Test the connection to Copilot Studio
   */
  async testConnection(accessToken: string): Promise<boolean> {
    try {
      await this.initializeCopilotClient(accessToken);
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}