import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import { NavItem, Project, StaffMember, GalleryImage, YouTubeVideo, ViewerLog, ProjectViewerLog, ProjectAlert } from './types';
import { useAuth } from './contexts/AuthContext';
import LoginScreen from './screens/LoginScreen';
import ProfileScreen from './screens/ProfileScreen';
import HomeView from './components/HomeView';
import AboutUsView from './components/AboutUsView';
import ContactUsView from './components/ContactUsView';
import DashboardView from './components/DashboardView';
import ProjectsView from './components/ProjectsView';
import ClientsView from './components/ClientsView';
import FinanceView from './components/FinanceView';
import { UsersStatusView } from './components/UsersStatusView';
import { SettingsView } from './components/SettingsView';
import { CustomerPortalView } from './components/CustomerPortalView';
import { RBACGuard } from './components/RBACGuard';
import { SimulatedMailbox } from './components/SimulatedMailbox';
import { loadVideoBlob } from './utils/indexedDB';
import {
  mockProjects,
  mockClients,
  mockFinanceData,
  ourServicesData,
  initialStaff,
  initialCompanyGallery,
  initialViewerLogs,
  initialProjectTrackerLogs,
  initialProjectAlerts
} from './constants';

const App: React.FC = () => {
  const { user, loading } = useAuth();
  const [redirectedFrom, setRedirectedFrom] = useState<string | null>(null);
  const [navigation, setNavigation] = useState<NavItem[]>([
    { name: 'Home', href: '#', current: true },
    { name: 'About Us', href: '#', current: false },
    { name: 'Contact Us', href: '#', current: false },
    { name: 'Customer Portal', href: '#', current: false },
    { name: 'Dashboard', href: '#', current: false },
    { name: 'Projects', href: '#', current: false },
    { name: 'Clients', href: '#', current: false },
    { name: 'Finance', href: '#', current: false },
    { name: 'Users Status', href: '#', current: false },
    { name: 'Profile', href: '#', current: false },
    { name: 'Settings', href: '#', current: false },
    { name: 'Login', href: '#', current: false },
  ]);
  
  const [ourServices, setOurServices] = useState(() => {
    const saved = localStorage.getItem('kestrelOurServices');
    return saved ? JSON.parse(saved) : ourServicesData;
  });

  const [homeContent, setHomeContent] = useState(() => {
    const saved = localStorage.getItem('kestrelHomeContent');
    return saved ? JSON.parse(saved) : {
      heroTitle: 'Welcome to Kestrel AI Solution',
      heroSubtitle: 'Empowering Business Transformation Through Innovative AI Technology.',
      historyTitle: 'Our History',
      historyText: 'Kestrel AI Solution was founded on 22.01.2024 by Mr Eshwar Ganta, our visionary CEO & Founder, along with a dedicated team of software developers driven by a passion for pioneering solutions. Since then, we have evolved into a premier software development company, catering to clients across diverse industries. Our journey is defined by a commitment to innovation and excellence, propelling us to the forefront of the technology landscape.',
      historyImage: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      approachTitle: 'Our Approach',
      approachText: 'At Kestrel AI Solution, we take a collaborative approach to software development. We work closely with our clients to gain a deep understanding of their business needs and goals, and we use that knowledge to develop tailored solutions that meet their unique requirements.',
      approachImage: 'https://images.pexels.com/photos/7750763/pexels-photo-7750763.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      servicesTitle: 'Our Services',
      servicesText: 'We offer a wide range of software development services, including web development, mobile app development, and custom software development. We use the latest technologies and tools to ensure that our clients receive cutting-edge solutions that drive their business forward.',
      servicesImage: 'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    };
  });

  const [servicesPage, setServicesPage] = useState(0);
  const servicesPerPage = 2;
  const totalServicePages = Math.ceil(ourServices.length / servicesPerPage);
  const paginatedServices = ourServices.slice(servicesPage * servicesPerPage, (servicesPage + 1) * servicesPerPage);

  const [viewerLogs, setViewerLogs] = useState<ViewerLog[]>(() => {
    const saved = localStorage.getItem('kestrelViewerLogs');
    return saved ? JSON.parse(saved) : initialViewerLogs;
  });

  const [projectViewerLogs, setProjectViewerLogs] = useState<ProjectViewerLog[]>(() => {
    const saved = localStorage.getItem('kestrelProjectViewerLogs');
    return saved ? JSON.parse(saved) : initialProjectTrackerLogs;
  });

  const [projectAlerts, setProjectAlerts] = useState<ProjectAlert[]>(() => {
    const saved = localStorage.getItem('kestrelProjectAlerts');
    return saved ? JSON.parse(saved) : initialProjectAlerts;
  });

  const [staff, setStaff] = useState<StaffMember[]>(() => {
    const saved = localStorage.getItem('kestrelStaff');
    return saved ? JSON.parse(saved) : initialStaff;
  });

  const [companyGallery, setCompanyGallery] = useState<GalleryImage[]>(() => {
    const saved = localStorage.getItem('kestrelGallery');
    return saved ? JSON.parse(saved) : initialCompanyGallery;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('kestrelProjects');
    return saved ? JSON.parse(saved) : mockProjects;
  });
  const [companyVideos, setCompanyVideos] = useState<YouTubeVideo[]>(() => {
    const saved = localStorage.getItem('kestrelVideos');
    return saved ? JSON.parse(saved) : [
      {
        id: 'qp0HIF3SfI4',
        title: 'Kestrel AI Solution Showcase',
        description: 'Empowering Business Transformation Through Innovative AI Technology.',
        url: 'https://www.youtube.com/watch?v=qp0HIF3SfI4',
        isLiked: true
      },
      {
        id: '2',
        title: 'Future of AI Software Development',
        description: 'A look at how we build next-generation applications with simplified logic and collaborative approaches.',
        url: 'https://www.youtube.com/watch?v=qp0HIF3SfI4'
      }
    ];
  });
  const [clients, setClients] = useState(() => {
    const saved = localStorage.getItem('kestrelClients');
    return saved ? JSON.parse(saved) : mockClients;
  });
  const [financeData, setFinanceData] = useState(() => {
    const saved = localStorage.getItem('kestrelFinanceData');
    return saved ? JSON.parse(saved) : mockFinanceData;
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('kestrelStaff', JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem('kestrelGallery', JSON.stringify(companyGallery));
  }, [companyGallery]);

  useEffect(() => {
    localStorage.setItem('kestrelProjects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('kestrelVideos', JSON.stringify(companyVideos));
  }, [companyVideos]);

  useEffect(() => {
    localStorage.setItem('kestrelViewerLogs', JSON.stringify(viewerLogs));
  }, [viewerLogs]);

  useEffect(() => {
    localStorage.setItem('kestrelOurServices', JSON.stringify(ourServices));
  }, [ourServices]);

  useEffect(() => {
    localStorage.setItem('kestrelHomeContent', JSON.stringify(homeContent));
  }, [homeContent]);

  useEffect(() => {
    localStorage.setItem('kestrelClients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('kestrelFinanceData', JSON.stringify(financeData));
  }, [financeData]);

  // Automatically capture and record visitor profile details for the Admin on successful login
  useEffect(() => {
    if (user) {
      const loggedKey = `kestrel_logged_${user.id}_${user.role}`;
      const alreadyLogged = localStorage.getItem(loggedKey);
      
      if (!alreadyLogged) {
        // Find coordinates and details for mapping
        const address = user.address || 'Gnanapuram, Visakhapatnam Space Park, India';
        
        // Parse country and state from location string if it exists
        let country = 'India';
        let state = 'Andhra Pradesh';
        if (user.location && user.location.includes(',')) {
          const parts = user.location.split(',');
          state = parts[0]?.trim() || 'Andhra Pradesh';
          country = parts[1]?.trim() || 'India';
        }

        // Coordinate presets for the map radar scanning circles
        const coords: Record<string, { lat: number; lng: number }> = {
          'India': { lat: 17.7200, lng: 83.2900 },
          'United States': { lat: 37.4220, lng: -122.0841 },
          'USA': { lat: 37.4220, lng: -122.0841 },
          'United Kingdom': { lat: 51.5120, lng: -0.0812 },
          'Germany': { lat: 52.5200, lng: 13.4050 },
          'Singapore': { lat: 1.3521, lng: 103.8198 },
          'Australia': { lat: -33.8688, lng: 151.2093 },
          'Japan': { lat: 35.6762, lng: 139.6503 },
          'Canada': { lat: 45.4215, lng: -75.6972 },
          'UAE': { lat: 24.4539, lng: 54.3773 }
        };

        const targetCoords = coords[country] || coords['India'];

        const newLog: ViewerLog = {
          id: 'viewer_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
          email: `${user.name} (${user.email})`, // Combine name and email to save details cleanly!
          country: country,
          state: state,
          areaAddress: address,
          latitude: targetCoords.lat,
          longitude: targetCoords.lng,
          timestamp: new Date().toLocaleTimeString(),
          device: navigator.userAgent.toLowerCase().includes('mobile') ? 'Smart Handheld Mobile' : 'Desktop Workstation',
          browser: 'Gateway Authenticator Gatepass',
          pageVisited: 'Validated Portal Session',
          viewDurationMs: Math.floor(Math.random() * 85000 + 45000)
        };

        setViewerLogs(prev => {
          // Prevent exact duplicate email on the exact same timestamp
          if (prev.some(l => l.email === newLog.email && l.timestamp === newLog.timestamp)) {
            return prev;
          }
          return [newLog, ...prev];
        });

        localStorage.setItem(loggedKey, 'true');
        console.log(`[Identity Checker] Saved and registered profile details for ${user.name} to Admin log reference.`);
      }
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('kestrelProjectViewerLogs', JSON.stringify(projectViewerLogs));
  }, [projectViewerLogs]);

  useEffect(() => {
    localStorage.setItem('kestrelProjectAlerts', JSON.stringify(projectAlerts));
  }, [projectAlerts]);

  // Restore uploaded local video blobs on mount
  useEffect(() => {
    const restoreVideos = async () => {
      let isChanged = false;
      const restored = await Promise.all(companyVideos.map(async (video) => {
        if (video.isUploaded) {
          try {
            const blob = await loadVideoBlob(video.id);
            if (blob) {
              const localUrl = URL.createObjectURL(blob);
              isChanged = true;
              return {
                ...video,
                url: localUrl,
                localVideoUrl: localUrl
              };
            }
          } catch (err) {
            console.error('Failed to restore video blob for id: ' + video.id, err);
          }
        }
        return video;
      }));

      if (isChanged) {
        setCompanyVideos(restored);
      }
    };

    restoreVideos();
  }, []);

  // Sync URL pathname with state-based navigation Tab
  useEffect(() => {
    const syncWithUrl = () => {
      const path = window.location.pathname.replace(/^\/|\/$/g, '').toLowerCase() || 
                   window.location.hash.replace(/^#\/?|#$/g, '').toLowerCase();
      
      const routeMap: { [key: string]: string } = {
        '': 'Home',
        'home': 'Home',
        'customer-portal': 'Customer Portal',
        'dashboard': 'Dashboard',
        'projects': 'Projects',
        'clients': 'Clients',
        'finance': 'Finance',
        'users-status': 'Users Status',
        'profile': 'Profile',
        'settings': 'Settings',
        'login': 'Login'
      };

       const matchedRoute = routeMap[path] || 'Home';
      const adminOnlyRoutes = ['Dashboard', 'Clients', 'Finance', 'Users Status', 'Settings'];
      const profileRoute = matchedRoute === 'Profile';
      
      const isUnauthorized = (adminOnlyRoutes.includes(matchedRoute) && (!user || user.role !== 'Admin')) ||
                             (profileRoute && !user);

      if (isUnauthorized) {
        setRedirectedFrom(matchedRoute);
        setNavigation(prev => prev.map(item => ({ ...item, current: item.name === 'Login' })));
        if (window.location.pathname !== '/login') {
          window.history.replaceState(null, '', '/login');
        }
      } else {
        setNavigation(prev => prev.map(item => ({ ...item, current: item.name === matchedRoute })));
      }
    };

    syncWithUrl();
    window.addEventListener('popstate', syncWithUrl);
    return () => window.removeEventListener('popstate', syncWithUrl);
  }, [user]);

  // Auto-redirect back to the requested restricted workspace once logged in successfully
  useEffect(() => {
    if (user) {
      if (redirectedFrom) {
        const isAdmin = user.role === 'Admin';
        const adminOnly = ['Dashboard', 'Clients', 'Finance', 'Users Status', 'Settings'];
        if (isAdmin || !adminOnly.includes(redirectedFrom)) {
          const target = redirectedFrom;
          setRedirectedFrom(null);
          handleNavigate(target);
        } else {
          setRedirectedFrom(null);
          handleNavigate('Home');
        }
      } else {
        // If they logged in on the Login screen but with no redirectedFrom reference, redirect to Home
        const currentActive = navigation.find(item => item.current)?.name;
        if (currentActive === 'Login') {
          handleNavigate('Home');
        }
      }
    }
  }, [user, redirectedFrom, navigation]);

  const handleServicePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalServicePages) {
        setServicesPage(newPage);
    }
  };

  const handleNavigate = (name: string) => {
    const adminOnlyRoutes = ['Dashboard', 'Clients', 'Finance', 'Users Status', 'Settings'];
    const profileRoute = name === 'Profile';
    
    const isUnauthorized = (adminOnlyRoutes.includes(name) && (!user || user.role !== 'Admin')) ||
                           (profileRoute && !user);

    if (isUnauthorized) {
      setRedirectedFrom(name);
      setNavigation(
        navigation.map(item => ({
          ...item,
          current: item.name === 'Login',
        }))
      );
      window.history.pushState(null, '', '/login');
      return;
    }

    setNavigation(
      navigation.map(item => ({
        ...item,
        current: item.name === name,
      }))
    );

    const slug = name === 'Home' ? '/' : `/${name.toLowerCase().replace(/ /g, '-')}`;
    if (window.location.pathname !== slug) {
      window.history.pushState(null, '', slug);
    }
  };
  
  const handleContactSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert('Thank you for your message! We will get back to you soon.');
    (e.target as HTMLFormElement).reset();
  };

  const scrollToContact = () => {
    const contactSection = document.getElementById('contact-us');
    contactSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const activeView = navigation.find(item => item.current)?.name;

  const renderContent = () => {
    switch (activeView) {
      case 'Home':
        return (
          <HomeView
            staff={staff}
            onUpdateStaff={setStaff}
            companyGallery={companyGallery}
            onUpdateGallery={setCompanyGallery}
            companyVideos={companyVideos}
            onUpdateVideos={setCompanyVideos}
            servicesPage={servicesPage}
            onServicePageChange={handleServicePageChange}
            onNavigate={handleNavigate}
            scrollToContact={scrollToContact}
            handleContactSubmit={handleContactSubmit}
            totalServicePages={totalServicePages}
            paginatedServices={paginatedServices}
            homeContent={homeContent}
            onUpdateHomeContent={setHomeContent}
            ourServices={ourServices}
            onUpdateOurServices={setOurServices}
          />
        );
      case 'About Us':
        return <AboutUsView onNavigate={handleNavigate} />;
      case 'Contact Us':
        return <ContactUsView handleContactSubmit={handleContactSubmit} />;
      case 'Customer Portal':
        return <CustomerPortalView />;
      case 'Dashboard':
        return (
          <RBACGuard allowedRoles={['Admin']} activeView={activeView || ''} onNavigate={handleNavigate}>
            <DashboardView 
              projects={projects} 
              clients={clients} 
              projectAlerts={projectAlerts}
              onUpdateAlerts={setProjectAlerts}
              viewerLogs={viewerLogs}
            />
          </RBACGuard>
        );
      case 'Projects':
        return <ProjectsView projects={projects} onUpdateProjects={setProjects} />;
      case 'Clients':
        return (
          <RBACGuard allowedRoles={['Admin']} activeView={activeView || ''} onNavigate={handleNavigate}>
            <ClientsView clients={clients} onUpdateClients={setClients} />
          </RBACGuard>
        );
      case 'Finance':
        return (
          <RBACGuard allowedRoles={['Admin']} activeView={activeView || ''} onNavigate={handleNavigate}>
            <FinanceView financeData={financeData} onUpdateFinance={setFinanceData} />
          </RBACGuard>
        );
      case 'Users Status':
        return (
          <RBACGuard allowedRoles={['Admin']} activeView={activeView || ''} onNavigate={handleNavigate}>
            <UsersStatusView
              projects={projects}
              viewerLogs={viewerLogs}
              projectViewerLogs={projectViewerLogs}
              onAddViewerLog={(newLog) => setViewerLogs([newLog, ...viewerLogs])}
              onAddProjectViewerLog={(newLog) => setProjectViewerLogs([newLog, ...projectViewerLogs])}
              onResetLogs={() => {
                setViewerLogs(initialViewerLogs);
                setProjectViewerLogs(initialProjectTrackerLogs);
              }}
            />
          </RBACGuard>
        );
      case 'Profile':
        return (
          <RBACGuard allowedRoles={['Admin', 'Visitor']} activeView={activeView || ''} onNavigate={handleNavigate}>
            <ProfileScreen />
          </RBACGuard>
        );
      case 'Settings':
        return (
          <RBACGuard allowedRoles={['Admin']} activeView={activeView || ''} onNavigate={handleNavigate}>
            <SettingsView
              onResetLogs={() => {
                setViewerLogs([]);
                setProjectViewerLogs([]);
              }}
              onNavigateHome={() => handleNavigate('Home')}
            />
          </RBACGuard>
        );
      case 'Login':
        return (
          <LoginScreen 
            onCancel={() => handleNavigate('Home')} 
            redirectedFrom={redirectedFrom || undefined} 
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-kestrel-blue"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <LoginScreen redirectedFrom={redirectedFrom || undefined} />
        <SimulatedMailbox />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Header navigation={navigation} onNavigate={handleNavigate} />
      <main className="max-w-[1650px] mx-auto px-4 sm:px-8 lg:px-12 py-10">
        {renderContent()}
      </main>
      <footer className="bg-kestrel-blue text-white py-12 mt-20">
        <div className="max-w-[1650px] mx-auto px-4 sm:px-8 lg:px-12 text-center">
          <p className="text-blue-50 font-medium">&copy; {new Date().getFullYear()} Kestrel AI Solution. All rights reserved.</p>
          <div className="mt-4 flex justify-center space-x-6">
            <a href="#" className="text-blue-100 hover:text-white font-semibold transition-colors">Privacy Policy</a>
            <a href="#" className="text-blue-100 hover:text-white font-semibold transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
      <SimulatedMailbox />
    </div>
  );
};

export default App;
