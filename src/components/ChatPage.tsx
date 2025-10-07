import { useState } from 'react';
import { toast } from 'sonner';

import { AgentConfig, Message, ShowValuesState } from '../types';
import { authenticationService, CopilotStudioService } from '../services';
import { MessageContent } from '../components/chat/MessageContent';
import { TroubleshootingGuide } from '../components/common/TroubleshootingGuide';
import { getEnvironmentConfig, maskValue } from '../utils';

export function ChatPage() {
  const [config, setConfig] = useState<AgentConfig>(getEnvironmentConfig());
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copilotClient, setCopilotClient] = useState<CopilotStudioService | null>(null);
  const [status, setStatus] = useState<{type: 'success' | 'error' | 'info', message: string} | null>(null);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const [showValues, setShowValues] = useState<ShowValuesState>({
    environmentId: false,
    agentId: false,
    tenantId: false,
    clientId: false
  });

  const handleConnect = async () => {
    if (!config.environmentId || !config.agentId || !config.tenantId || !config.clientId) {
      setStatus({type: 'error', message: 'Please fill in all configuration fields'});
      return;
    }

    setIsLoading(true);
    setStatus({type: 'info', message: 'Connecting to Copilot Studio...'});

    try {
      // Initialize Copilot Studio client
      const client = new CopilotStudioService(config);
      
      // Get access token via Microsoft authentication
      const accessToken = await authenticationService.getAccessToken(config);
      
      // Start a new conversation
      const response = await client.startNewConversation(accessToken);
      
      setCopilotClient(client);
      setIsConnected(true);
      
      // Add initial bot message if available
      if (response.content) {
        const botMessage: Message = {
          id: `bot-${Date.now()}`,
          content: response.content,
          role: 'assistant',
          timestamp: new Date(),
        };
        setMessages([botMessage]);
      }

      setStatus(null); // Clear any previous status
      toast.success('Connected to Copilot Studio successfully!');
    } catch (error: any) {
      console.error('Connection failed:', error);
      
      // Show more helpful error messages and automatically open troubleshooting for auth failures
      let errorMessage = `Connection failed: ${error.message}`;
      
      if (error.message.includes('Authentication failed') || 
          error.message.includes('unauthorized') || 
          error.message.includes('consent') ||
          error.message.includes('invalid_client')) {
        errorMessage += ' Click "Need Help?" for troubleshooting steps.';
        // Auto-open troubleshooting guide for auth failures
        setTimeout(() => setShowTroubleshooting(true), 1000);
      }
      
      setStatus({type: 'error', message: errorMessage});
      toast.error('Failed to connect to Copilot Studio');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !isConnected || !copilotClient) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputMessage,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Get fresh access token and send message
      const accessToken = await authenticationService.getAccessToken(config);
      const response = await copilotClient.sendMessage(inputMessage, accessToken);

      if (response.content) {
        const botMessage: Message = {
          id: `bot-${Date.now()}`,
          content: response.content,
          role: 'assistant',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error: any) {
      console.error('Failed to send message:', error);
      setStatus({type: 'error', message: 'Failed to send message'});
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setCopilotClient(null);
    setMessages([]);
    setStatus(null);
    toast.info('Disconnected from Copilot Studio');
  };

  const toggleAllValues = () => {
    const newState = !Object.values(showValues).some(v => v);
    setShowValues({
      environmentId: newState,
      agentId: newState,
      tenantId: newState,
      clientId: newState
    });
  };

  return (
    <div className="container">
      <h1 className="main-title">
        Simple Chat with Agent SDK & MCS
      </h1>

      {/* Agent Configuration */}
      <div className="card">
        <h2 className="card-title">Agent Configuration</h2>
        
        <div className="form-grid">
          <div className="form-group">
            <label className="label" htmlFor="environmentId">Environment ID</label>
            <div style={{position: 'relative'}}>
              <input
                id="environmentId"
                className="input"
                type={showValues.environmentId ? "text" : "password"}
                value={showValues.environmentId ? config.environmentId : maskValue(config.environmentId, showValues.environmentId)}
                onChange={(e) => setConfig(prev => ({ ...prev, environmentId: e.target.value }))}
                placeholder="Enter Environment ID"
                disabled={isConnected}
                style={{paddingRight: '45px'}}
              />
              {config.environmentId && (
                <button
                  type="button"
                  onClick={() => setShowValues((prev: ShowValuesState) => ({ ...prev, environmentId: !prev.environmentId }))}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                  disabled={isConnected}
                >
                  {showValues.environmentId ? '🙈' : '👁️'}
                </button>
              )}
            </div>
          </div>
          
          <div className="form-group">
            <label className="label" htmlFor="agentId">Agent Schema Name</label>
            <div style={{position: 'relative'}}>
              <input
                id="agentId"
                className="input"
                type={showValues.agentId ? "text" : "password"}
                value={showValues.agentId ? config.agentId : maskValue(config.agentId, showValues.agentId)}
                onChange={(e) => setConfig(prev => ({ ...prev, agentId: e.target.value }))}
                placeholder="Enter Agent Schema Name"
                disabled={isConnected}
                style={{paddingRight: '45px'}}
              />
              {config.agentId && (
                <button
                  type="button"
                  onClick={() => setShowValues((prev: ShowValuesState) => ({ ...prev, agentId: !prev.agentId }))}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                  disabled={isConnected}
                >
                  {showValues.agentId ? '🙈' : '👁️'}
                </button>
              )}
            </div>
          </div>
          
          <div className="form-group">
            <label className="label" htmlFor="tenantId">Tenant ID</label>
            <div style={{position: 'relative'}}>
              <input
                id="tenantId"
                className="input"
                type={showValues.tenantId ? "text" : "password"}
                value={showValues.tenantId ? config.tenantId : maskValue(config.tenantId, showValues.tenantId)}
                onChange={(e) => setConfig(prev => ({ ...prev, tenantId: e.target.value }))}
                placeholder="Enter Tenant ID"
                disabled={isConnected}
                style={{paddingRight: '45px'}}
              />
              {config.tenantId && (
                <button
                  type="button"
                  onClick={() => setShowValues((prev: ShowValuesState) => ({ ...prev, tenantId: !prev.tenantId }))}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                  disabled={isConnected}
                >
                  {showValues.tenantId ? '🙈' : '👁️'}
                </button>
              )}
            </div>
          </div>
          
          <div className="form-group">
            <label className="label" htmlFor="clientId">Client ID</label>
            <div style={{position: 'relative'}}>
              <input
                id="clientId"
                className="input"
                type={showValues.clientId ? "text" : "password"}
                value={showValues.clientId ? config.clientId : maskValue(config.clientId, showValues.clientId)}
                onChange={(e) => setConfig(prev => ({ ...prev, clientId: e.target.value }))}
                placeholder="Enter Client ID"
                disabled={isConnected}
                style={{paddingRight: '45px'}}
              />
              {config.clientId && (
                <button
                  type="button"
                  onClick={() => setShowValues((prev: ShowValuesState) => ({ ...prev, clientId: !prev.clientId }))}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                  disabled={isConnected}
                >
                  {showValues.clientId ? '🙈' : '👁️'}
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Show All Values Toggle */}
        {(config.environmentId || config.agentId || config.tenantId || config.clientId) && (
          <div style={{marginTop: '12px', textAlign: 'right'}}>
            <button
              type="button"
              onClick={toggleAllValues}
              style={{
                background: 'none',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                padding: '4px 8px',
                cursor: 'pointer',
                fontSize: '12px',
                color: '#6b7280'
              }}
              disabled={isConnected}
            >
              {Object.values(showValues).some(v => v) ? 'Hide All Values' : 'Show All Values'}
            </button>
          </div>
        )}
        
        <div style={{marginTop: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap'}}>
          <button 
            className="button"
            onClick={handleConnect}
            disabled={isLoading || isConnected}
          >
            {isLoading ? 'Connecting...' : isConnected ? 'Connected' : 'Connect'}
          </button>
          
          {isConnected && (
            <button 
              className="button button-secondary"
              onClick={handleDisconnect}
            >
              Disconnect
            </button>
          )}
          
          <button 
            className="button button-secondary"
            onClick={() => setShowTroubleshooting(true)}
            style={{marginLeft: 'auto'}}
          >
            Need Help?
          </button>
        </div>

        {status && (
          <div className={`status ${status.type}`} style={{marginTop: '12px'}}>
            {status.message}
          </div>
        )}
      </div>

      {/* Chat Interface */}
      <div className="card chat-container">
        <h2 className="card-title">Conversation</h2>
        
        {/* Messages Area */}
        <div className="messages">
          {messages.length === 0 ? (
            <div className="empty-state">
              {isConnected ? 'Start a conversation by typing a message below' : 'Connect to an agent to start chatting'}
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`message ${message.role}`}>
                <div className="message-content">
                  <MessageContent content={message.content} />
                  <div className="message-time">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Area */}
        <div className="input-area">
          <textarea
            className="message-input"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isConnected ? "Type your message..." : "Connect to an agent first"}
            disabled={!isConnected || isLoading}
            rows={1}
          />
          <button
            className="button send-button"
            onClick={handleSendMessage}
            disabled={!isConnected || !inputMessage.trim() || isLoading}
          >
            {isLoading ? '...' : 'Send'}
          </button>
        </div>
      </div>
      
      <TroubleshootingGuide 
        isVisible={showTroubleshooting}
        onClose={() => setShowTroubleshooting(false)}
      />
    </div>
  );
}