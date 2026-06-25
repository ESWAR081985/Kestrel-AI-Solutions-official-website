export type OAuthProvider = 'google' | 'microsoft' | 'github';

export interface SimulatedOAuthProfile {
  name: string;
  email: string;
  picture: string;
  jobTitle: string;
  bio: string;
  address: string;
  location: string;
  whatsapp: string;
}

/**
 * Simulates an external API call to fetch OAuth details based on provider and custom claims
 */
export const fetchSimulatedOAuthDetails = async (
  provider: OAuthProvider,
  currentName: string,
  currentEmail: string
): Promise<SimulatedOAuthProfile> => {
  // Simulate network delay for authentication handshake and payload retrieval
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const safeName = currentName || 'Eshwar Ganta';
  const safeEmail = currentEmail || 'eshwar@kestrelaisolutions.com';

  switch (provider) {
    case 'google':
      return {
        name: safeName,
        email: safeEmail,
        picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&h=256&auto=format&fit=crop',
        jobTitle: 'Chief Technology Architect (Google Unified Workspace SSO)',
        bio: `Managing workspace automation, server-side APIs, and high-performance machine learning deployments. Federated Identity authenticated via Google OAuth 2.0 with strict IAM controls.`,
        address: 'DNO.10-259, Plot No.16, Visalakshi Nagar, Visakhapatnam, Andhra Pradesh, 530043, India',
        location: 'Visakhapatnam, Andhra Pradesh, India',
        whatsapp: '+91 8897226495'
      };

    case 'microsoft':
      return {
        name: safeName,
        email: safeEmail.endsWith('.com') ? safeEmail : 'eshwar@kestrelaisolutions.com',
        picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&h=256&auto=format&fit=crop',
        jobTitle: 'Principal Systems Orchestrator (Microsoft Entra Verified ID)',
        bio: `Supervising hybrid cloud architectures, SQL databases, and enterprise authentication channels using Active Directory controls. Microsoft Partner Network credentials enabled.`,
        address: 'Kestrel HQ Suite 402, Technology Park, Andhra Pradesh, India',
        location: 'Hyderabad, Telangana, India',
        whatsapp: '+91 8897226495'
      };

    case 'github':
      const githubUsername = safeName.toLowerCase().replace(/\s+/g, '-');
      return {
        name: `${safeName} (${githubUsername})`,
        email: `dev_${githubUsername}@github.com`,
        picture: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=256&h=256&auto=format&fit=crop',
        jobTitle: 'Senior Full-Stack Developer (GitHub Authorized Developer Profile)',
        bio: `Full-Stack DevOps engineer specialized in distributed state management, secure compiler flows, and GitHub Actions orchestration pipelines. Authorized via OAuth Token (scope: read:user, user:email).`,
        address: 'DNO.10-259, Visual Codecraft Studio, Visakhapatnam, India',
        location: 'Visakhapatnam, Andhra Pradesh, India',
        whatsapp: '+91 8897226495'
      };

    default:
      throw new Error('Unsupported OAuth Provider');
  }
};
