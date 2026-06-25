import React from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  picture: string; // URL to the profile picture
  role: 'Admin' | 'Visitor';
  address?: string;
  location?: string;
  whatsapp?: string;
  jobTitle?: string;
  bio?: string;
}

export interface DashboardCardProps {
  title: React.ReactNode;
  value?: string;
  change?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  titleClassName?: string;
}

export interface GrowthChartData {
  name: string;
  value: number;
}

export interface NavItem {
  name:string;
  href: string;
  current: boolean;
}

export interface HeaderProps {
  navigation: NavItem[];
  onNavigate: (name: string) => void;
}

export interface Milestone {
  id: string;
  name: string;
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Delayed';
}

export interface Project {
  id: number;
  type: 'service' | 'product';
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
  title: string;
  description: string;
  imageUrl: string;
  client?: string;
  technologies?: string[];
  valueProposition?: string;
  features?: string[];
  startDate?: string;
  endDate?: string;
  milestones?: Milestone[];
  deployedUrl?: string;
  demoVideoUrl?: string;
}

export interface Client {
  id: number;
  name: string;
  industry: string;
  country: string;
}

export interface FinanceTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'revenue' | 'expense';
}

export interface ChartDataItem {
    name: string;
    value: number;
}

export interface StaffMember {
  id: number;
  name: string;
  title: string;
  imageUrl: string | null;
  defaultImageUrl: string;
}

export interface GalleryImage {
  id: number;
  src: string;
  alt: string;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  url: string;
  isLiked?: boolean;
  isUploaded?: boolean;
  localVideoUrl?: string;
}

export interface ViewerLog {
  id: string;
  email: string;
  country: string;
  state: string;
  areaAddress: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  device: string;
  browser: string;
  pageVisited: string;
  viewDurationMs: number;
}

export interface ProjectViewerLog {
  id: string;
  email: string;
  projectId: number;
  projectTitle: string;
  country: string;
  state: string;
  areaAddress: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  device: string;
  action: 'Viewed Demo' | 'Opened Repo' | 'Inspected Milestones' | 'Shared Configuration';
}

export interface ProjectAlert {
  id: string;
  projectId?: number;
  projectTitle: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  message: string;
  timestamp: string;
  resolved: boolean;
  milestoneName?: string;
}

export interface EmailLog {
  id: string;
  recipientEmail: string;
  recipientName: string;
  senderEmail: string;
  subject: string;
  body: string;
  triggerType: 'Registration' | 'Verification' | 'First Login' | 'Inactivity';
  status: 'SENT' | 'DELIVERED' | 'BOUNCED' | 'PENDING';
  timestamp: string;
  openRate: boolean;
}


