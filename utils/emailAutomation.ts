import { EmailLog } from '../types';

export const emailTemplates = {
  Registration: {
    subject: 'Welcome to Kestrel AI Solutions!',
    sender: 'eswar@kestrelaisolutions.com',
    senderName: 'Eshwar Ganta',
    body: `Dear Valued Member,

Welcome to Kestrel AI Solutions!

Thank you for joining our growing community of innovators, developers, businesses, and AI enthusiasts.

We are delighted to have you with us and look forward to helping you leverage the power of Artificial Intelligence, Data Science, Machine Learning, Generative AI, Graph Technology, and Intelligent Automation solutions.

As a registered member, you can explore our latest services, products, resources, and AI-powered solutions designed to accelerate digital transformation and business growth.

What You Can Expect:
• Innovative AI & GenAI Solutions
• Data Science & Analytics Services
• Machine Learning Applications
• Intelligent Automation Tools
• Technical Resources & Insights
• Dedicated Customer Support

We are committed to delivering reliable, scalable, and future-ready technology solutions that create real business value.

If you have any questions or need assistance, our team is always here to help.

Thank you for choosing Kestrel AI Solutions.

Best Regards,

Eshwar Ganta
Founder & CEO
Kestrel AI Solutions

Email: eswar@kestrelaisolutions.com
Website: https://www.kestrelaisolutions.com`
  },
  Verification: {
    subject: 'Thank You for Confirming Your Email ID!',
    sender: 'eswar@kestrelaisolutions.com',
    senderName: 'Eshwar Ganta',
    body: `Dear Valued Member,

Thank you for confirming and verifying your email with Kestrel AI Solutions!

Your security status has been successfully elevated to VERIFIED. This completes your credential onboarding phase and activates secure JSON Web Token (JWT) session claims.

With a fully verified profile, you now have safe and complete access to the following premium workspace capabilities:
• Full Project Status Checklists & Milestones
• Secure Client Telemetry & Geographic Maps
• Customer Portal Interactive AI Playgrounds
• Multi-Currency Live Financial Invoices

We take identity verification seriously to safeguard our network and ensure all collaborative project workspaces remain locked under verified trust chains.

Thank you for choosing us as your technology partner.

Best Regards,

Eshwar Ganta
Founder & CEO
Kestrel AI Solutions

Email: eswar@kestrelaisolutions.com
Website: https://www.kestrelaisolutions.com`
  },
  'First Login': {
    subject: 'Kestrel Portal: Your Getting Started Guide',
    sender: 'eswar@kestrelaisolutions.com',
    senderName: 'Eshwar Ganta',
    body: `Dear Valued Member,

Congratulations on logging in for the first time! This is your official Getting Started Guide to maximize your Kestrel AI Solutions Workspace.

Follow these 3 simple steps to begin configuring your environment:

1. UPDATE YOUR PROFILE claims:
Navigate to the upper right member dropdown, click "Your Profile," and configure your delivery physical address, contact parameters, and active business status.

2. EXPLORE REAL-TIME MAP ANALYTICS:
Check the main dashboard page. Observe our GIS Coordinate radar and Google Maps embeds showing active client and visitor telemetry states globally.

3. CO-MANAGE ACTIVE DEVELOPMENT PROJECTS:
Visit the "Projects" tab to view live milestones, developer tasks, custom scope briefs, and invoices. Check for warning status signs if resource milestones require adjustments.

We are committed to delivering reliable, scalable, and future-ready technology solutions that create real business value for you.

Best Regards,

Eshwar Ganta
Founder & CEO
Kestrel AI Solutions

Email: eswar@kestrelaisolutions.com
Website: https://www.kestrelaisolutions.com`
  },
  Inactivity: {
    subject: 'We Miss You! See What’s New at Kestrel AI Solutions',
    sender: 'eswar@kestrelaisolutions.com',
    senderName: 'Eshwar Ganta',
    body: `Dear Valued Member,

It has been over 7 days since your last active session, and we wanted to touch base to show you what our developer teams have deployed in your absence!

We have introduced significant upgrades to our AI status dashboard, designed to give you deeper operational visibility:
• Dual maps: Toggle between Real-Time GIS radar coordinates and Standard high-fidelity Google Maps.
• Hardened policies: Role-Based Access Controls (RBAC) are actively enforcing cryptographic JWT credentials.
• Visual team cards: See our verified executive team roster with designations locked securely under Admin controls.

Don't let your technology momentum stop. Sign back into the portal now to review updated financial metrics or check development progress:
https://www.kestrelaisolutions.com

If you have any questions or require custom solutions in Generative AI, Machine Learning, or Intelligent Automation, our consulting team is always here to help.

Best Regards,

Eshwar Ganta
Founder & CEO
Kestrel AI Solutions

Email: eswar@kestrelaisolutions.com
Website: https://www.kestrelaisolutions.com`
  }
};

// Seed initial email logs to make the visual audit dashboard immediately spectacular
const initialEmailLogs: EmailLog[] = [
  {
    id: 'em-1',
    recipientEmail: 'sanjay.k@gmail.com',
    recipientName: 'Sanjay Kumar',
    senderEmail: 'eswar@kestrelaisolutions.com',
    subject: emailTemplates.Registration.subject,
    body: emailTemplates.Registration.body,
    triggerType: 'Registration',
    status: 'DELIVERED',
    timestamp: new Date(Date.now() - 365000000).toLocaleString(),
    openRate: true
  },
  {
    id: 'em-2',
    recipientEmail: 'sanjay.k@gmail.com',
    recipientName: 'Sanjay Kumar',
    senderEmail: 'eswar@kestrelaisolutions.com',
    subject: emailTemplates.Verification.subject,
    body: emailTemplates.Verification.body,
    triggerType: 'Verification',
    status: 'DELIVERED',
    timestamp: new Date(Date.now() - 350000000).toLocaleString(),
    openRate: true
  },
  {
    id: 'em-3',
    recipientEmail: 'eshwar.g.guest@gmail.com',
    recipientName: 'Eshwar Ganta',
    senderEmail: 'eswar@kestrelaisolutions.com',
    subject: emailTemplates['First Login'].subject,
    body: emailTemplates['First Login'].body,
    triggerType: 'First Login',
    status: 'DELIVERED',
    timestamp: new Date(Date.now() - 250000000).toLocaleString(),
    openRate: true
  },
  {
    id: 'em-4',
    recipientEmail: 'sarah.j@microsoft.com',
    recipientName: 'Sarah Jenkins',
    senderEmail: 'eswar@kestrelaisolutions.com',
    subject: emailTemplates.Inactivity.subject,
    body: emailTemplates.Inactivity.body,
    triggerType: 'Inactivity',
    status: 'SENT',
    timestamp: new Date(Date.now() - 120000000).toLocaleString(),
    openRate: false
  }
];

export const getEmailLogs = (): EmailLog[] => {
  try {
    const saved = localStorage.getItem('kestrelEmailLogs');
    if (saved) {
      return JSON.parse(saved);
    }
    localStorage.setItem('kestrelEmailLogs', JSON.stringify(initialEmailLogs));
    return initialEmailLogs;
  } catch (e) {
    console.error('Failed to get email logs:', e);
    return initialEmailLogs;
  }
};

export const saveEmailLogs = (logs: EmailLog[]): void => {
  try {
    localStorage.setItem('kestrelEmailLogs', JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save email logs', e);
  }
};

export const triggerAutomatedEmail = (
  recipientEmail: string,
  recipientName: string,
  triggerType: 'Registration' | 'Verification' | 'First Login' | 'Inactivity'
): EmailLog => {
  const logs = getEmailLogs();
  
  const template = emailTemplates[triggerType];
  const newLog: EmailLog = {
    id: 'em-' + Math.random().toString(36).substring(2, 9),
    recipientEmail,
    recipientName,
    senderEmail: template.sender,
    subject: template.subject,
    body: template.body,
    triggerType,
    status: Math.random() > 0.05 ? 'DELIVERED' : 'SENT', // 95% delivery rate
    timestamp: new Date().toLocaleString(),
    openRate: false
  };

  const updatedLogs = [newLog, ...logs];
  saveEmailLogs(updatedLogs);

  try {
    const event = new CustomEvent('email-triggered', { detail: newLog });
    window.dispatchEvent(event);
  } catch (err) {
    console.error('Failed to dispatch simulated email event:', err);
  }

  return newLog;
};
