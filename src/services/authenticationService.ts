import { 
  PublicClientApplication, 
  Configuration, 
  SilentRequest,
  RedirectRequest
} from '@azure/msal-browser';
import { AgentConfig } from '../types';

class AuthenticationService {
  private msalInstance: PublicClientApplication | null = null;

  async getAccessToken(config: AgentConfig): Promise<string> {
    if (!this.msalInstance) {
      await this.initializeMSAL(config);
    }

    if (!this.msalInstance) {
      throw new Error('Failed to initialize MSAL');
    }

    // Use the working scopes pattern from your other project
    const scopes = [
      'https://api.powerplatform.com/.default'
    ];

    try {
      // Try to get token silently first
      const accounts = this.msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        const silentRequest: SilentRequest = {
          scopes,
          account: accounts[0],
        };

        try {
          const response = await this.msalInstance.acquireTokenSilent(silentRequest);
          return response.accessToken;
        } catch {
          console.log('Silent token acquisition failed, falling back to interactive');
        }
      }

      // Fall back to interactive login with prompt selection
      const loginRequest: RedirectRequest = {
        scopes,
        prompt: 'select_account',
      };

      console.log('Attempting authentication with config:', {
        clientId: config.clientId,
        tenantId: config.tenantId,
        scopes: loginRequest.scopes
      });
      
      const response = await this.msalInstance.acquireTokenPopup(loginRequest);
      console.log('Authentication successful');
      return response.accessToken;
    } catch (error: any) {
      console.error('Token acquisition failed:', error);
      
      // Provide more specific error messages
      if (error.errorCode === 'interaction_required') {
        throw new Error('Authentication failed: User interaction required. Please ensure popup blockers are disabled.');
      } else if (error.errorCode === 'consent_required') {
        throw new Error('Authentication failed: Admin consent required for the application.');
      } else if (error.errorCode === 'invalid_client') {
        throw new Error('Authentication failed: Invalid client configuration. Please check your Client ID.');
      } else if (error.errorCode === 'unauthorized_client') {
        throw new Error('Authentication failed: Client not authorized. Please check app registration settings.');
      } else {
        throw new Error(`Authentication failed: ${error.message || error.errorCode || 'Unknown error'}`);
      }
    }
  }

  private async initializeMSAL(config: AgentConfig): Promise<void> {
    const msalConfig: Configuration = {
      auth: {
        clientId: config.clientId,
        authority: `https://login.microsoftonline.com/${config.tenantId}`,
        redirectUri: window.location.origin,
      },
      cache: {
        cacheLocation: 'sessionStorage',
        storeAuthStateInCookie: false,
      },
    };

    this.msalInstance = new PublicClientApplication(msalConfig);
    await this.msalInstance.initialize();
  }
}

export const authenticationService = new AuthenticationService();