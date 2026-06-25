import { Project, Client, FinanceTransaction, StaffMember, GalleryImage, ViewerLog, ProjectViewerLog, ProjectAlert } from './types';

export const mockProjects: Project[] = [
  { 
    id: 1, 
    type: 'service', 
    status: 'Completed', 
    title: 'AI-Powered Logistics Optimization', 
    client: 'Global Freight Inc.', 
    description: 'Developed a custom AI model to optimize delivery routes, reducing fuel costs by 18%.', 
    imageUrl: 'https://images.pexels.com/photos/4483610/pexels-photo-4483610.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 
    technologies: ['Python', 'TensorFlow', 'Google Maps API'], 
    startDate: '2024-01-15', 
    endDate: '2024-05-20',
    deployedUrl: 'https://logistics-optimizer.example.com',
    demoVideoUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eHpxeHpxeHpxeHpxeHpxeHpxeHpxeHpxeHpxeHpxeHpxeHpxJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxx6rO/giphy.gif',
    milestones: [
      { id: 'm1', name: 'Data Collection & Analysis', dueDate: '2024-02-10', status: 'Completed' },
      { id: 'm2', name: 'Model Development', dueDate: '2024-03-25', status: 'Completed' },
      { id: 'm3', name: 'Deployment & Testing', dueDate: '2024-05-15', status: 'Completed' }
    ]
  },
  { 
    id: 2, 
    type: 'product', 
    status: 'In Progress', 
    title: 'Intelligent Chatbot Assistant', 
    valueProposition: 'Deploy a 24/7 customer support chatbot on your website in minutes.', 
    description: 'A ready-to-deploy NLP-powered chatbot that integrates with popular CRM platforms.', 
    imageUrl: 'https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 
    features: ['Natural Language Understanding', 'CRM Integration', 'Analytics Dashboard'], 
    startDate: '2024-03-01', 
    endDate: '2024-12-31',
    demoVideoUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eHpxeHpxeHpxeHpxeHpxeHpxeHpxeHpxeHpxeHpxeHpxeHpxJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l41lTfuxV3K632892/giphy.gif',
    milestones: [
      { id: 'm4', name: 'Core NLP Engine', dueDate: '2024-05-01', status: 'Completed' },
      { id: 'm5', name: 'CRM Integration Module', dueDate: '2024-08-15', status: 'In Progress' },
      { id: 'm6', name: 'Beta Launch', dueDate: '2024-11-01', status: 'Pending' }
    ]
  },
  { 
    id: 3, 
    type: 'product', 
    status: 'In Progress', 
    title: 'Sales Forecast Predictor', 
    valueProposition: 'Predict future sales trends with 95% accuracy.', 
    description: 'A machine learning product that analyzes historical data to provide actionable sales forecasts.', 
    imageUrl: 'https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 
    features: ['Time-series Analysis', 'Data Visualization', 'API Access'], 
    startDate: '2024-06-10', 
    endDate: '2025-02-15',
    milestones: [
      { id: 'm7', name: 'Historical Data Ingestion', dueDate: '2024-07-15', status: 'Completed' },
      { id: 'm8', name: 'Predictive Algorithm V1', dueDate: '2024-10-20', status: 'In Progress' }
    ]
  },
  { 
    id: 4, 
    type: 'service', 
    status: 'Completed', 
    title: 'RAG Implementation for Enterprise', 
    client: 'Innovate Corp.', 
    description: 'Built a Retrieval-Augmented Generation system for internal knowledge base search.', 
    imageUrl: 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 
    technologies: ['Gen AI', 'Large Language Models', 'RAG'], 
    startDate: '2023-11-01', 
    endDate: '2024-04-15',
    milestones: [
      { id: 'm9', name: 'Knowledge Base Indexing', dueDate: '2023-12-15', status: 'Completed' },
      { id: 'm10', name: 'RAG Pipeline Setup', dueDate: '2024-02-20', status: 'Completed' }
    ]
  },
];

export const mockClients: { personal: Client[], business: Client[] } = {
  personal: [
    { id: 1, name: 'Alice Johnson', industry: 'Individual', country: 'USA' },
    { id: 2, name: 'Rintarou Okabe', industry: 'Individual', country: 'Japan' },
  ],
  business: [
    { id: 1, name: 'Global Freight Inc.', industry: 'Logistics', country: 'USA' },
    { id: 2, name: 'Innovate Corp.', industry: 'Technology', country: 'India' },
    { id: 3, name: 'EuroBiz GmbH', industry: 'Finance', country: 'Germany' },
  ],
};

export const mockFinanceData: FinanceTransaction[] = [
  { id: 'txn_1', date: '2024-07-20', description: 'Payment from Global Freight Inc.', amount: 2000000, type: 'revenue' },
  { id: 'txn_2', date: '2024-07-18', description: 'Cloud Service Subscription', amount: -500000, type: 'expense' },
  { id: 'txn_3', date: '2024-07-15', description: 'License Sale - Chatbot', amount: 500000, type: 'revenue' },
  { id: 'txn_4', date: '2024-07-12', description: 'Salaries', amount: -1500000, type: 'expense' },
];

export const ourServicesData = [
  {
    title: 'Custom Software Development',
    description: 'At Kestrel AI Solution, we provide custom software development services to help businesses achieve their goals. With our expertise, we can create software tailored to your specific needs and requirements.',
    imageUrl: 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  {
    title: 'Our Developments & Services',
    description: [
      'Data Science',
      'Machine Learning Engineering',
      'Natural Language Processing (NLP)',
      'AI-based Object detection & classification',
      'AI-based Web Application Development',
      'AI-based Graph Technology',
      'AI-based Gen AI, Large Language Models & RAG',
      'AI-based Business Analytics',
      'Comprehensive Servicing Available'
    ],
    imageUrl: 'https://images.pexels.com/photos/8386434/pexels-photo-8386434.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  {
    title: 'Web Development',
    description: 'Our web development team delivers creative and responsive web designs that are optimized for performance. We use the latest technologies to create web solutions that meet your business needs.',
    imageUrl: 'https://images.pexels.com/photos/160107/pexels-photo-160107.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  {
    title: 'Cloud Computing',
    description: 'Our cloud computing services help businesses to increase their efficiency and reduce costs. We provide cloud solutions that are secure, scalable, and reliable.',
    imageUrl: 'https://images.pexels.com/photos/325229/pexels-photo-325229.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  {
    title: 'Product Testing and Quality Assurance',
    description: 'We offer comprehensive product testing and quality assurance services to ensure that your software meets the highest standards. Our team of experts is dedicated to providing effective testing solutions.',
    imageUrl: 'https://images.pexels.com/photos/3861964/pexels-photo-3861964.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  {
    title: 'IT Consulting',
    description: 'Our IT consulting services help businesses to streamline their operations and increase their productivity. We provide expert advice and guidance to help you make informed decisions.',
    imageUrl: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  }
];

export const initialStaff: StaffMember[] = [
    { id: 1, name: 'Mr. Eshwar Ganta', title: 'CEO & Founder', imageUrl: null, defaultImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop' },
    { id: 2, name: 'Jane Doe', title: 'Chief Technology Officer', imageUrl: null, defaultImageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1887&auto=format&fit=crop' },
    { id: 3, name: 'John Smith', title: 'Lead AI Engineer', imageUrl: null, defaultImageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1887&auto=format&fit=crop' }
];

export const initialCompanyGallery: GalleryImage[] = [
    { id: 1, src: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', alt: 'Team meeting with laptops' },
    { id: 2, src: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', alt: 'Collaborative team working at a table' },
    { id: 3, src: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', alt: 'Team celebrating success' },
    { id: 4, src: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', alt: 'Developer coding on a laptop' },
];

export const initialViewerLogs: ViewerLog[] = [
  {
    id: 'view_1',
    email: 'eswarganta1985@gmail.com',
    country: 'India',
    state: 'Andhra Pradesh',
    areaAddress: 'Gnanapuram, Visakhapatnam Space Park',
    latitude: 17.7200,
    longitude: 83.2900,
    timestamp: '10:14:02 AM',
    device: 'Desktop Windows 11',
    browser: 'Chrome Pro Agent v126',
    pageVisited: 'Home Feed',
    viewDurationMs: 120000
  },
  {
    id: 'view_2',
    email: 'srinivasan.m@tcs.com',
    country: 'India',
    state: 'Tamil Nadu',
    areaAddress: 'OMR Road Technology Corridor, Chennai',
    latitude: 13.0827,
    longitude: 80.2707,
    timestamp: '11:22:15 AM',
    device: 'MacBook Pro M3 Max',
    browser: 'Safari Secure Engine',
    pageVisited: 'AI Solutions Catalog',
    viewDurationMs: 440000
  },
  {
    id: 'view_3',
    email: 'sarah.k@google.com',
    country: 'USA',
    state: 'California',
    areaAddress: '1600 Amphitheatre Pkwy, Mountain View',
    latitude: 37.4220,
    longitude: -122.0841,
    timestamp: '09:05:41 AM',
    device: 'Chromebook Enterprise',
    browser: 'Google Chrome dev-v127',
    pageVisited: 'Leaderboard Analytics',
    viewDurationMs: 600000
  },
  {
    id: 'view_4',
    email: 'james.miller@microsoft.com',
    country: 'USA',
    state: 'Washington',
    areaAddress: 'One Microsoft Way, Redmond',
    latitude: 47.6740,
    longitude: -122.1215,
    timestamp: '08:45:10 PM',
    device: 'Desktop Surface Tech',
    browser: 'Microsoft Edge AI App',
    pageVisited: 'Finance Ledger',
    viewDurationMs: 180000
  },
  {
    id: 'view_5',
    email: 'george.clarke@accenture.co.uk',
    country: 'United Kingdom',
    state: 'Greater London',
    areaAddress: '30 Fenchurch St, London EC3M 3BD',
    latitude: 51.5120,
    longitude: -0.0812,
    timestamp: '06:12:30 PM',
    device: 'iPad Pro iOS 17',
    browser: 'Mobile Safari',
    pageVisited: 'Home Feed',
    viewDurationMs: 95000
  }
];

export const initialProjectTrackerLogs: ProjectViewerLog[] = [
  {
    id: 'p_view_1',
    email: 'eswarganta1985@gmail.com',
    projectId: 1,
    projectTitle: 'AI-Powered Logistics Optimization',
    country: 'India',
    state: 'Andhra Pradesh',
    areaAddress: 'Visakhapatnam SEZ, Vizag',
    latitude: 17.6868,
    longitude: 83.2185,
    timestamp: '10:15:30 AM',
    device: 'Desktop Space Terminal',
    action: 'Viewed Demo'
  },
  {
    id: 'p_view_2',
    email: 'eval.officer@andhrabusiness.gov.in',
    projectId: 2,
    projectTitle: 'Intelligent Chatbot Assistant',
    country: 'India',
    state: 'Andhra Pradesh',
    areaAddress: 'Amaravati High Tech Precinct, Vijayawada',
    latitude: 16.5062,
    longitude: 80.6480,
    timestamp: '03:40:11 PM',
    device: 'Desktop Windows 11',
    action: 'Inspected Milestones'
  },
  {
    id: 'p_view_3',
    email: 'capitalist_round@sequoiacap.com',
    projectId: 3,
    projectTitle: 'Sales Forecast Predictor',
    country: 'USA',
    state: 'California',
    areaAddress: 'Sand Hill Road, Menlo Park',
    latitude: 37.4250,
    longitude: -122.2030,
    timestamp: '01:05:46 AM',
    device: 'MacBook Air M2',
    action: 'Opened Repo'
  }
];

export const initialProjectAlerts: ProjectAlert[] = [
  {
    id: 'alert_1',
    projectId: 1,
    projectTitle: 'AI-Powered Logistics Optimization',
    type: 'critical',
    message: 'Milestone "Predictive Route Dispatcher" has missed its target deadline and is marked Delayed.',
    timestamp: '10:14:02 AM',
    resolved: false,
    milestoneName: 'Predictive Route Dispatcher'
  },
  {
    id: 'alert_2',
    projectId: 2,
    projectTitle: 'Intelligent Chatbot Assistant',
    type: 'warning',
    message: 'Milestone "Integration with MS Teams" is scheduled to end in 2 days. Fast-track peer testing required.',
    timestamp: '11:22:15 AM',
    resolved: false,
    milestoneName: 'Integration with MS Teams'
  },
  {
    id: 'alert_3',
    projectId: 3,
    projectTitle: 'Sales Forecast Predictor',
    type: 'success',
    message: 'Milestone "Regression Training Engine Pipeline" successfully passed 99.8% precision validation tests.',
    timestamp: '09:05:41 AM',
    resolved: false,
    milestoneName: 'Regression Training Engine Pipeline'
  },
  {
    id: 'alert_4',
    projectId: 1,
    projectTitle: 'AI-Powered Logistics Optimization',
    type: 'info',
    message: 'Client stakeholder checked project roadmap from Amaravati Space Park node.',
    timestamp: '08:45:10 PM',
    resolved: true
  }
];

