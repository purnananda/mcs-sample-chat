/**
 * Masks sensitive values for display purposes
 * @param value The value to mask
 * @param show Whether to show the actual value
 * @returns Masked or original value
 */
export const maskValue = (value: string, show: boolean): string => {
  if (!value || show) return value;
  if (value.length <= 8) return '•'.repeat(value.length);
  return value.substring(0, 4) + '•'.repeat(Math.max(4, value.length - 8)) + value.substring(value.length - 4);
};

/**
 * Gets environment variable values with fallbacks
 */
export const getEnvironmentConfig = () => ({
  environmentId: import.meta.env.VITE_ENVIRONMENT_ID || '',
  agentId: import.meta.env.VITE_AGENT_ID || '',
  tenantId: import.meta.env.VITE_TENANT_ID || '',
  clientId: import.meta.env.VITE_CLIENT_ID || ''
});