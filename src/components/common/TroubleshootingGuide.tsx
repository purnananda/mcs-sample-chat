interface TroubleshootingGuideProps {
  isVisible: boolean;
  onClose: () => void;
}

export function TroubleshootingGuide({ isVisible, onClose }: TroubleshootingGuideProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Authentication Troubleshooting Guide</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-medium mb-2">1. Azure App Registration Setup</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Create an App Registration in Azure Portal</li>
              <li>Set Platform as "Single-page application (SPA)"</li>
              <li>Add redirect URI: <code className="bg-gray-100 px-1 rounded">{window.location.origin}</code></li>
              <li>Enable "Access tokens" and "ID tokens" in Authentication</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">2. Required API Permissions</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Microsoft Graph: User.Read (delegated)</li>
              <li>PowerPlatform API: Use the ".default" scope for broader access</li>
              <li>Alternative: Specific scopes - Chatbots.Inquire and Chatbots.Read</li>
              <li>Grant admin consent for your organization</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">3. Common Issues</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Ensure popup blockers are disabled</li>
              <li>Check if Client ID matches your App Registration</li>
              <li>Verify Tenant ID is correct</li>
              <li>Confirm Environment ID and Agent Schema Name are valid</li>
              <li>Check browser console for detailed error messages</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">4. Environment & Agent Configuration</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Environment ID: Found in Power Platform admin center</li>
              <li>Agent Schema Name: Found in Copilot Studio agent settings (not the display name)</li>
              <li>Ensure the agent is published and accessible</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}