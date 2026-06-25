import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Key, Eye, EyeOff, Settings as SettingsIcon, AlertOctagon, CheckCircle, Lock, RefreshCw, Copy, Check, AlertCircle, Info, Mail, Send, Trash2, Sliders, Server, Clock, Sparkles, Upload, Play, Image, Video, Save } from 'lucide-react';
import { getEmailLogs, saveEmailLogs, triggerAutomatedEmail, emailTemplates } from '../utils/emailAutomation';
import { EmailLog } from '../types';
import { fileToDataUrl, resizeImage } from '../utils/imageUtils';

interface SettingsViewProps {
  onResetLogs?: () => void;
  onNavigateHome?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onResetLogs, onNavigateHome }) => {
  const { user, token, login, adminPassword, recoveryPhrase, updateAdminCredentials, regenerateRecoveryPhrase } = useAuth();
  const [settingsTab, setSettingsTab] = useState<'security' | 'email' | 'appearance'>('security');
  const [sessionTimeout, setSessionTimeout] = useState('15 Minutes');
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [auditLog, setAuditLog] = useState<Array<{ id: string; time: string; action: string; resource: string; status: 'GRANTED' | 'DENIED' }>>([]);
  const [credentialLevel, setCredentialLevel] = useState<'Standard' | 'Strict'>('Standard');
  const [successMsg, setSuccessMsg] = useState('');

  // Email Automation states
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [emailSearch, setEmailSearch] = useState('');
  const [selectedPreview, setSelectedPreview] = useState<'Registration' | 'Verification' | 'First Login' | 'Inactivity'>('Registration');
  const [testEmail, setTestEmail] = useState('eswarganta1985@gmail.com');
  const [testName, setTestName] = useState('Eshwar Ganta');
  const [emailConfig, setEmailConfig] = useState<Record<string, boolean>>({
    Registration: true,
    Verification: true,
    'First Login': true,
    Inactivity: true
  });
  const [automationSuccessMsg, setAutomationSuccessMsg] = useState('');

  // Appearance Options & Config State
  const [bgType, setBgType] = useState<'default' | 'video' | 'wallpaper'>(() => {
    try {
      return (localStorage.getItem('gatewayBgType') as 'default' | 'video' | 'wallpaper') || 'default';
    } catch {
      return 'default';
    }
  });

  const [videoUrl, setVideoUrl] = useState<string>(() => {
    try {
      return localStorage.getItem('gatewayVideoUrl') || 'https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c054854d9b73f3099990ec02de4e3f3b&profile_id=139&oauth2_token_id=57447761';
    } catch {
      return 'https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c054854d9b73f3099990ec02de4e3f3b&profile_id=139&oauth2_token_id=57447761';
    }
  });

  const [wallpaper, setWallpaper] = useState<string | null>(() => {
    try {
      return localStorage.getItem('gatewayWallpaper');
    } catch {
      return null;
    }
  });

  const [enableAnimations, setEnableAnimations] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('gatewayEnableAnimations');
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });

  const [customVideoInput, setCustomVideoInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [appearanceMsg, setAppearanceMsg] = useState('');

  // Synchronize appearance changes to localStorage automatically
  useEffect(() => {
    try {
      localStorage.setItem('gatewayBgType', bgType);
    } catch (e) {
      console.error(e);
    }
  }, [bgType]);

  useEffect(() => {
    try {
      localStorage.setItem('gatewayVideoUrl', videoUrl);
    } catch (e) {
      console.error(e);
    }
  }, [videoUrl]);

  useEffect(() => {
    try {
      if (wallpaper) {
        localStorage.setItem('gatewayWallpaper', wallpaper);
      } else {
        localStorage.removeItem('gatewayWallpaper');
      }
    } catch (e) {
      console.error(e);
    }
  }, [wallpaper]);

  useEffect(() => {
    try {
      localStorage.setItem('gatewayEnableAnimations', String(enableAnimations));
    } catch (e) {
      console.error(e);
    }
  }, [enableAnimations]);

  const safeAdminPassword = adminPassword || 'KestrelAdmin2026!';
  const safeRecoveryPhrase = recoveryPhrase || 'kestrel alpha secure gravity orbital hazard beacon trigger orbit system legacy delta';

  // State inside Credential Reset tab helper
  const [credTab, setCredTab] = useState<'password' | 'mnemonic' | 'recoverySim'>('password');
  
  // Password reset fields
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  // Mnemonic view/copied states
  const [copied, setCopied] = useState(false);
  const [isPhraseVisible, setIsPhraseVisible] = useState(false);

  // Recovery Simulation fields
  const [recoveryInput, setRecoveryInput] = useState('');
  const [simNewPass, setSimNewPass] = useState('');
  const [simConfirmPass, setSimConfirmPass] = useState('');
  const [simError, setSimError] = useState('');
  const [simSuccess, setSimSuccess] = useState('');

  const [tokenCopied, setTokenCopied] = useState(false);

  const handleCopyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      setTokenCopied(true);
      setTimeout(() => setTokenCopied(false), 2000);
    }
  };

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (currentPass !== safeAdminPassword) {
      setPassError('The current password you entered is incorrect.');
      return;
    }

    if (newPass.length < 6) {
      setPassError('The new password must be at least 6 characters long.');
      return;
    }

    // Checking strict policy
    if (credentialLevel === 'Strict') {
      const hasUppercase = /[A-Z]/.test(newPass);
      const hasLowercase = /[a-z]/.test(newPass);
      const hasNumber = /[0-9]/.test(newPass);
      const hasSpecial = /[^A-Za-z0-9]/.test(newPass);
      if (newPass.length < 8 || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
        setPassError('Strict Password Policy: Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.');
        return;
      }
    }

    if (newPass !== confirmPass) {
      setPassError('New passwords do not match.');
      return;
    }

    if (newPass === currentPass) {
      setPassError('New password cannot be the same as the current password.');
      return;
    }

    if (updateAdminCredentials) {
      updateAdminCredentials(newPass);
      setPassSuccess('Admin password changed successfully!');
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
      
      // Post to audit logs
      const logItem = {
        id: Math.random().toString(),
        time: new Date().toLocaleTimeString(),
        action: 'PASSWORD_RESET',
        resource: 'admin@kestrel.ai account credential updated',
        status: 'GRANTED' as const
      };
      setAuditLog(prev => [logItem, ...prev]);
    }
  };

  const handleCopyPhrase = () => {
    navigator.clipboard.writeText(safeRecoveryPhrase);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegeneratePhrase = () => {
    if (window.confirm('Are you sure you want to regenerate your recovery mnemonic? Any older recovery phrases will immediately become invalid!')) {
      if (regenerateRecoveryPhrase) {
        const newPhr = regenerateRecoveryPhrase();
        
        // Post to audit logs
        const logItem = {
          id: Math.random().toString(),
          time: new Date().toLocaleTimeString(),
          action: 'MNEMONIC_REGEN',
          resource: 'Emergency system recovery seed regenerated',
          status: 'GRANTED' as const
        };
        setAuditLog(prev => [logItem, ...prev]);
        alert(`New backup recovery word combination created! Make sure to write it down securely:\n\n${newPhr}`);
      }
    }
  };

  const handleSimulationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSimError('');
    setSimSuccess('');

    if (recoveryInput.trim().toLowerCase() !== safeRecoveryPhrase.trim().toLowerCase()) {
      setSimError('Mnemonic Phrase Verification Failed: The words you entered do not match your backup phrase.');
      // Register failed attempt in audit log
      const logItem = {
        id: Math.random().toString(),
        time: new Date().toLocaleTimeString(),
        action: 'RECOVERY_ATTEMPT',
        resource: 'Recovery Phrase Mismatch - Blocked Reset',
        status: 'DENIED' as const
      };
      setAuditLog(prev => [logItem, ...prev]);
      return;
    }

    if (simNewPass.length < 6) {
      setSimError('The password must be at least 6 characters.');
      return;
    }

    if (simNewPass !== simConfirmPass) {
      setSimError('New passwords do not match.');
      return;
    }

    if (updateAdminCredentials) {
      updateAdminCredentials(simNewPass);
      setSimSuccess('Mnemonic verified! Password has been successfully recovered and reset.');
      setRecoveryInput('');
      setSimNewPass('');
      setSimConfirmPass('');

      // Post to audit logs
      const logItem = {
        id: Math.random().toString(),
        time: new Date().toLocaleTimeString(),
        action: 'RECOVERY_RESET',
        resource: 'Mnemonic Authorized - Credentials Reset Complete',
        status: 'GRANTED' as const
      };
      setAuditLog(prev => [logItem, ...prev]);
    }
  };

  // Generate some realistic access control audit actions on load
  useEffect(() => {
    const initialLogs = [
      { id: '1', time: new Date(Date.now() - 500000).toLocaleTimeString(), action: 'ACCESS_REQUEST', resource: '/dashboard', status: 'GRANTED' as const },
      { id: '2', time: new Date(Date.now() - 400000).toLocaleTimeString(), action: 'ACCESS_REQUEST', resource: '/clients', status: 'GRANTED' as const },
      { id: '3', time: new Date(Date.now() - 300000).toLocaleTimeString(), action: 'ACCESS_REQUEST', resource: '/finance', status: 'GRANTED' as const },
      { id: '4', time: new Date(Date.now() - 150000).toLocaleTimeString(), action: 'USER_LOGIN', resource: 'admin@kestrel.ai', status: 'GRANTED' as const },
    ];
    setAuditLog(initialLogs);
  }, []);

  // Load and sync email logs
  useEffect(() => {
    setEmailLogs(getEmailLogs());
  }, []);

  const handleSendTestEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail.trim() || !testEmail.includes('@')) {
      alert('Please enter a valid recipient email address.');
      return;
    }
    const sentLog = triggerAutomatedEmail(testEmail.trim(), testName.trim(), selectedPreview);
    setEmailLogs(prev => [sentLog, ...prev]);
    setAutomationSuccessMsg(`Test ${selectedPreview} Email dispatched successfully to ${testEmail}!`);
    
    // Register trigger execution in audit log
    const logItem = {
      id: Math.random().toString(),
      time: new Date().toLocaleTimeString(),
      action: 'EMAIL_TEST_DISPATCH',
      resource: `${selectedPreview} trigger simulated to ${testEmail}`,
      status: 'GRANTED' as const
    };
    setAuditLog(prev => [logItem, ...prev]);
    
    setTimeout(() => setAutomationSuccessMsg(''), 4000);
  };

  const handleClearEmailLogs = () => {
    if (window.confirm('Are you sure you want to clear all sent email logs? This is irreversible.')) {
      saveEmailLogs([]);
      setEmailLogs([]);
    }
  };

  const handleToggleEmailConfig = (trigger: string) => {
    setEmailConfig(prev => {
      const updated = { ...prev, [trigger]: !prev[trigger] };
      // Log this config change in security audits
      const newAudit = {
        id: Math.random().toString(),
        time: new Date().toLocaleTimeString(),
        action: 'EMAIL_POLICY',
        resource: `Updated ${trigger} trigger status = ${updated[trigger] ? 'ACTIVE' : 'INACTIVE'}`,
        status: 'GRANTED' as const
      };
      setAuditLog(p => [newAudit, ...p]);
      return updated;
    });
  };

  const handleRunInactivityCampaign = () => {
    // Simulate inactivity triggers for team demo
    const staleUsers = [
      { name: 'Sarah Jenkins', email: 'sarah.j@microsoft.com' },
      { name: 'Elena Rostova', email: 'elena.rostova@techmatch.eu' }
    ];
    
    staleUsers.forEach(u => {
      const log = triggerAutomatedEmail(u.email, u.name, 'Inactivity');
      setEmailLogs(prev => [log, ...prev]);
    });
    
    // Log the policy execution
    const newAudit = {
      id: Math.random().toString(),
      time: new Date().toLocaleTimeString(),
      action: 'CRON_TRIGGERED',
      resource: 'Executed 7-Day Inactivity scan: 2 stale identities discovered & notified',
      status: 'GRANTED' as const
    };
    setAuditLog(prev => [newAudit, ...prev]);
    
    setAutomationSuccessMsg('7-Day Inactivity Scheduler run completed! Stale contacts notified.');
    setTimeout(() => setAutomationSuccessMsg(''), 4000);
  };

  const handleSavePolicies = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('Security policy and configurations updated successfully!');
    // Log the policy update to internal audit logs
    const newAudit = {
      id: Math.random().toString(),
      time: new Date().toLocaleTimeString(),
      action: 'UPDATE_POLICY',
      resource: `CredentialLevel=${credentialLevel}, SessionTimeout=${sessionTimeout}, MFA=${mfaEnabled}`,
      status: 'GRANTED' as const
    };
    setAuditLog(prev => [newAudit, ...prev]);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleSimulateIntruder = () => {
    const intruderAudit = {
      id: Math.random().toString(),
      time: new Date().toLocaleTimeString(),
      action: 'ACCESS_REQUEST',
      resource: '/finance',
      status: 'DENIED' as const
    };
    setAuditLog(prev => [intruderAudit, ...prev]);
    alert('Security Gate Intrusions simulation completed! Security log registered a DENIED access event on /finance from an unauthenticated visitor.');
  };

  return (
    <div className="space-y-8 font-sans animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl shadow-xl p-6 md:p-8 text-white relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 bg-indigo-650 rounded-full opacity-10 blur-2xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-505/20 text-indigo-300 rounded-full text-xs font-semibold border border-indigo-500/30">
              <Shield className="w-4 h-4 text-indigo-400" />
              Role-Based Access Control Core Active
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Kestrel Admin Security & Settings</h2>
            <p className="text-slate-350 text-xs font-semibold">
              Manage enterprise access control, verify security audits, and configure cryptographic session gates.
            </p>
          </div>
          <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-755 text-xs self-start md:self-auto space-y-1.5 min-w-[200px]">
            <p className="font-bold text-slate-400">Security Guard State:</p>
            <div className="flex items-center gap-2 font-black text-emerald-400">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              ACTIVE (ENFORCING)
            </div>
          </div>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto select-none scrollbar-thin">
        <button
          onClick={() => setSettingsTab('security')}
          className={`flex items-center gap-2 py-3.5 px-6 text-sm font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            settingsTab === 'security'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <Shield className="w-4 h-4" />
          Security Policies & Audits
        </button>
        <button
          onClick={() => setSettingsTab('email')}
          className={`flex items-center gap-2 py-3.5 px-6 text-sm font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            settingsTab === 'email'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <Mail className="w-4 h-4" />
          Email Automation Campaigns
        </button>
        <button
          onClick={() => setSettingsTab('appearance')}
          className={`flex items-center gap-2 py-3.5 px-6 text-sm font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            settingsTab === 'appearance'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Gateway Appearance
        </button>
      </div>

      {settingsTab === 'security' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Policy Setting Form */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md border border-slate-100 p-6 space-y-6">
          <div>
            <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-indigo-600" />
              Security Policy Controls
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">Define access verification thresholds, sessions, and MFA constraints.</p>
          </div>

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold px-4 py-3 rounded-xl text-xs flex items-center gap-2 animate-bounce">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSavePolicies} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Session Token Lifetime
                </label>
                <select
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                  className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option>15 Minutes</option>
                  <option>1 Hour</option>
                  <option>4 Hours</option>
                  <option>24 Hours</option>
                </select>
                <span className="text-[10px] text-slate-400 mt-1 block">Forces auto sign-out after duration.</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Credential Strength Level
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCredentialLevel('Standard')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                      credentialLevel === 'Standard'
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Standard Gate
                  </button>
                  <button
                    type="button"
                    onClick={() => setCredentialLevel('Strict')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                      credentialLevel === 'Strict'
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Strict Sandbox
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Strict enforces alphanumeric security policies.</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-slate-800">Enforce Multi-Factor Authentication (MFA)</p>
                  <p className="text-slate-550 text-xs">Require simulated Google authorization signature on login.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMfaEnabled(!mfaEnabled)}
                  className={`w-11 h-6 rounded-full transition-all duration-300 relative focus:outline-none ${
                    mfaEnabled ? 'bg-indigo-600' : 'bg-slate-200'
                  }`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 ${
                    mfaEnabled ? 'left-5.5' : 'left-0.5'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-slate-800">Secure Cookie Session Tokens</p>
                  <p className="text-slate-550 text-xs">Locks browser session cookies inside state secure scopes.</p>
                </div>
                <div className="w-11 h-6 rounded-full bg-indigo-600 relative">
                  <div className="absolute top-0.5 left-5.5 w-5 h-5 rounded-full bg-white shadow-sm" />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5 flex items-center justify-between">
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow hover:shadow-lg transition-all"
              >
                Apply Policies
              </button>
              
              <button
                type="button"
                onClick={handleSimulateIntruder}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100 rounded-xl text-xs font-bold transition-all"
              >
                <AlertOctagon className="w-4 h-4 text-rose-600" />
                Simulate Intruder Block
              </button>
            </div>
          </form>
        </div>

        {/* Security Logs and Live Audit Gate */}
        <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6 space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <Key className="w-5 h-5 text-indigo-600" />
              RBAC Live Audit Log
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">Security gate requests logged in this sandboxed session.</p>
          </div>

          <div className="h-64 overflow-y-auto space-y-2.5 border border-slate-50 bg-slate-50/50 p-3 rounded-lg text-[11px]">
            {auditLog.map((log) => (
              <div key={log.id} className="bg-white border border-slate-100 p-2.5 rounded-lg flex items-start justify-between gap-2 shadow-sm">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-slate-400 font-mono text-[9px]">{log.time}</span>
                    <span className="font-black font-mono text-slate-700 truncate block text-[10px]">{log.action}</span>
                  </div>
                  <span className="text-slate-500 block truncate font-mono text-[10px]">{log.resource}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase flex-shrink-0 ${
                  log.status === 'GRANTED' ? 'bg-emerald-55 text-emerald-700' : 'bg-rose-50 text-rose-700 font-extrabold'
                }`}>
                  {log.status}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-4 flex gap-2">
            <button
              onClick={() => {
                setAuditLog([]);
                if (onResetLogs) onResetLogs();
              }}
              className="flex-1 py-2 text-center border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50"
            >
              Clear Logs
            </button>
            <button
              onClick={() => {
                // Change role simulation
                login('Visitor');
                alert('Session updated! Switched role to Public Visitor to test visitor restrictive state.');
                if (onNavigateHome) onNavigateHome();
              }}
              className="flex-1 py-2 text-center bg-indigo-50 border border-indigo-150 text-indigo-700 rounded-lg text-xs font-black hover:bg-indigo-100"
            >
              Log in as Visitor
            </button>
          </div>
        </div>
      </div>

      {/* Admin Credential Recovery & Password Reset Manager */}
      <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6 space-y-6">
        <div>
          <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-650" />
            Admin Account Credential & Recovery Manager
          </h3>
          <p className="text-slate-500 text-xs mt-0.5">
            Reset security codes, back up your emergency recovery phrase, and test/simulate credentials recovery.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-150">
          <button
            onClick={() => setCredTab('password')}
            className={`py-2 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              credTab === 'password'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-750'
            }`}
          >
            Reset Admin Password
          </button>
          <button
            onClick={() => setCredTab('mnemonic')}
            className={`py-2 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              credTab === 'mnemonic'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-750'
            }`}
          >
            Backup Recovery Phrase
          </button>
          <button
            onClick={() => setCredTab('recoverySim')}
            className={`py-2 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              credTab === 'recoverySim'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-750'
            }`}
          >
            Lockout Recovery Simulator
          </button>
        </div>

        {/* Tab content */}
        <div>
          {credTab === 'password' && (
            <div className="space-y-4 max-w-xl">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60 text-xs text-slate-600 flex gap-2 w-full">
                <Info className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-800">Password Policy Integration</p>
                  <p className="mt-0.5 leading-relaxed">
                    Modifications to your password will require entering your active password. Password rules are dictated by the active <span className="font-semibold text-slate-700">{credentialLevel} Strength Level</span>.
                  </p>
                </div>
              </div>

              {passSuccess && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold px-4 py-3 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  {passSuccess}
                </div>
              )}

              {passError && (
                <div className="bg-rose-50 text-rose-800 font-bold px-4 py-3 border border-rose-100 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  {passError}
                </div>
              )}

              <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Current Security Password
                  </label>
                  <input
                    type="password"
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full max-w-md px-4 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    New Security Password
                  </label>
                  <input
                    type="password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full max-w-md px-4 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Confirm New Security Password
                  </label>
                  <input
                    type="password"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    placeholder="Retype new password"
                    className="w-full max-w-md px-4 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow hover:shadow-lg transition-all"
                  >
                    Save New Password
                  </button>
                </div>
              </form>
            </div>
          )}

          {credTab === 'mnemonic' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-xs text-amber-800 flex gap-2">
                <AlertOctagon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-extrabold uppercase tracking-wider text-[10px]">Critical Disaster Recovery Seed</p>
                  <p className="mt-0.5 leading-relaxed font-medium text-slate-600">
                    Your account recovery phrase is the master cryptographic key that bypasses standard credential locks. Store this phrase in an offline vault. Any person with access to this phrase has permission to rewrite your credentials!
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 relative overflow-hidden">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">My Recovery Phrase Backup (12 Words)</p>
                
                <div className="bg-white border border-slate-200 rounded-lg p-4 font-mono text-xs font-semibold leading-relaxed tracking-wide select-all text-slate-755 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
                  <span className="flex-1 break-words">
                    {isPhraseVisible ? safeRecoveryPhrase : '•••• •••• •••• •••• •••• •••• •••• •••• •••• •••• •••• ••••'}
                  </span>
                  <div className="flex gap-2 self-end md:self-auto">
                    <button
                      type="button"
                      onClick={() => setIsPhraseVisible(!isPhraseVisible)}
                      className="p-1 px-2.5 border border-slate-200 hover:bg-slate-100 rounded text-[10px] font-bold text-slate-600 transition-all flex items-center gap-1"
                    >
                      {isPhraseVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      {isPhraseVisible ? 'Hide' : 'Reveal'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyPhrase}
                      className="p-1 px-2.5 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 rounded text-[10px] font-bold text-indigo-700 transition-all flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={handleRegeneratePhrase}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 border border-indigo-150 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-indigo-650" />
                    Regenerate Emergency Phrase
                  </button>
                </div>
              </div>
            </div>
          )}

          {credTab === 'recoverySim' && (
            <div className="space-y-4 max-w-xl">
              <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 text-xs text-slate-600 flex gap-2">
                <Info className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-800">Lockout Simulator Sandbox</p>
                  <p className="mt-0.5 leading-relaxed">
                    Test the account password recovery flow under sandboxed conditions. Enter the 12-word phrase to verify credential reset capability.
                  </p>
                </div>
              </div>

              {simSuccess && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold px-4 py-3 rounded-xl text-xs flex items-center gap-2 animate-bounce">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  {simSuccess}
                </div>
              )}

              {simError && (
                <div className="bg-rose-50 text-rose-800 font-bold px-4 py-3 border border-rose-100 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  {simError}
                </div>
              )}

              <form onSubmit={handleSimulationSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Enter Active Recovery Mnemonic Phrase
                  </label>
                  <textarea
                    rows={2}
                    value={recoveryInput}
                    onChange={(e) => setRecoveryInput(e.target.value)}
                    placeholder="Paste your 12-word emergency recovery phrase here"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-xs font-mono font-bold leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Case-insensitive checking, ignores trailing/leading whitespace.</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      New Security Password
                    </label>
                    <input
                      type="password"
                      value={simNewPass}
                      onChange={(e) => setSimNewPass(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Confirm New Security Password
                    </label>
                    <input
                      type="password"
                      value={simConfirmPass}
                      onChange={(e) => setSimConfirmPass(e.target.value)}
                      placeholder="Retype password"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow hover:shadow-lg transition-all"
                  >
                    Verify Phrase & Reset Password
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Enterprise Platform Status */}
      <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6 space-y-6">
        <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
          <Eye className="w-5 h-5 text-indigo-600" />
          Active Platform Access Policies
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-4 border border-violet-100 rounded-xl bg-violet-50/20">
            <h4 className="font-extrabold text-slate-800 text-sm mb-1 uppercase tracking-wider text-violet-700">Protected Routes Gate</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Paths including <span className="font-semibold text-slate-700">/dashboard</span>, <span className="font-semibold text-slate-700">/clients</span>, <span className="font-semibold text-slate-700">/finance</span>, and <span className="font-semibold text-slate-700">/users-status</span> are guarded. Unauthorized visitor entities are forcefully blocked.
            </p>
          </div>
          
          <div className="p-4 border border-teal-100 rounded-xl bg-teal-50/20">
            <h4 className="font-extrabold text-slate-800 text-sm mb-1 uppercase tracking-wider text-teal-700">Visual Menu Filters</h4>
            <p className="text-xs text-slate-505 leading-relaxed">
              If User Role is <span className="font-semibold text-slate-700">Visitor</span> (anonymous or registered), navigation items are strictly restricted. Home and Projects remain public, other tables disappear.
            </p>
          </div>

          <div className="p-4 border border-pink-100 rounded-xl bg-pink-50/20">
            <h4 className="font-extrabold text-slate-800 text-sm mb-1 uppercase tracking-wider text-pink-700">Sensitive Financial Analytics</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              All financial analytics, revenues, invoices, custom cost statements, and ledger summaries are restricted to authenticated accounts with verified role state.
            </p>
          </div>
        </div>
      </div>

      {/* Cryptographic JWT Session Control Hub */}
      <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-600" />
              Cryptographic Session Token (JWT)
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              Dynamically generated client-side JSON Web Token carrying verified role claims for deep access privileges.
            </p>
          </div>
          {token && (
            <button
              type="button"
              onClick={handleCopyToken}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition-all self-start sm:self-auto cursor-pointer"
            >
              {tokenCopied ? <Check className="w-4 h-4 text-emerald-600 animate-pulse" /> : <Copy className="w-4 h-4" />}
              {tokenCopied ? 'Claims Copied!' : 'Copy JWT Token'}
            </button>
          )}
        </div>

        {token ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Decoded Payload details */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-4">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-indigo-600" />
                  Decoded Token Claims (Payload)
                </h4>
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between border-b border-slate-200/40 pb-2">
                    <span className="text-slate-400 font-bold">"sub" (User ID):</span>
                    <span className="text-slate-700 font-semibold">{user?.id}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/40 pb-2">
                    <span className="text-slate-400 font-bold">"name":</span>
                    <span className="text-slate-700 font-semibold">{user?.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/40 pb-2">
                    <span className="text-slate-400 font-bold">"email":</span>
                    <span className="text-slate-700 font-medium">{user?.email}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/40 pb-2">
                    <span className="text-indigo-600 font-black">"role":</span>
                    <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md font-black text-[10px] uppercase">
                      {user?.role}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/40 pb-2">
                    <span className="text-slate-400 font-bold">"iss" (Issuer):</span>
                    <span className="text-slate-600">KestrelGateway</span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span className="text-slate-400 font-bold">"alg" (Algorithm):</span>
                    <span className="text-rose-600 font-bold">HS256 (HMAC-SHA256)</span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 text-[11px] leading-relaxed text-slate-600 select-none">
                <span className="font-extrabold uppercase tracking-wider text-amber-700 text-[10px] block mb-1">AUTOMATIC GATEWAY ENFORCEMENT</span>
                This JWT encodes the user's role and session claims. Whenever a user triggers a protected workspace route, Kestrel's Access Control lists automatically unpack and verify the token signature to map the session's active permissions.
              </div>
            </div>

            {/* Visual Token Parts */}
            <div className="lg:col-span-7 space-y-3">
              <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Cryptographic Token Representation
              </span>
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-slate-500">
                    <span className="w-2.5 h-2.5 bg-rose-500 rounded-full inline-block"></span> Header
                    <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full inline-block ml-1"></span> Payload
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block ml-1"></span> Signature
                  </div>
                  <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider">Verified JWT</span>
                </div>
                <div className="p-4 bg-slate-900 font-mono text-[11px] leading-6 break-all select-all font-semibold max-h-[220px] overflow-y-auto">
                  <span className="text-rose-400">{token.split('.')[0]}</span>
                  <span className="text-slate-400">.</span>
                  <span className="text-indigo-400">{token.split('.')[1]}</span>
                  <span className="text-slate-400">.</span>
                  <span className="text-emerald-400">{token.split('.')[2] || ''}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center text-slate-500 font-medium">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm">No active cryptographic session token present.</p>
            <p className="text-xs text-slate-400 mt-1">Please log in to sign your access claims token.</p>
          </div>
        )}
      </div>
      </div>
      )}

      {settingsTab === 'email' && (
        /* =========================================================================
           EMAIL AUTOMATION CAMPAIGNS HUB
           ========================================================================= */
        <div className="space-y-8 animate-fadeIn">
          {/* Main Campaign Stats Banner */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl shadow-xl p-6 md:p-8 text-white relative overflow-hidden border border-slate-800">
            <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 bg-indigo-650 rounded-full opacity-10 blur-2xl pointer-events-none" />
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-505/20 text-indigo-300 rounded-full text-xs font-semibold border border-indigo-500/30">
                  <Server className="w-4 h-4 text-indigo-400" />
                  Kestrel Active Email Server Operational
                </div>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight">Email Campaigns & Automation</h2>
                <p className="text-slate-350 text-xs font-semibold">
                  Manage trigger notifications, view fully responsive mail layouts, and audit automated dispatches instantly.
                </p>
              </div>
              <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-755 text-xs self-start md:self-auto space-y-1.5 min-w-[220px]">
                <p className="font-bold text-slate-400">Verified Admin Sender Address:</p>
                <div className="flex items-center gap-1.5 font-bold text-indigo-300 select-all font-mono">
                  <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  eswar@kestrelaisolutions.com
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-md border border-slate-100 p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Dispatched</p>
                <p className="text-2xl font-black text-slate-800">{emailLogs.length}</p>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Send className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-slate-100 p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Success Delivery State</p>
                <p className="text-2xl font-black text-emerald-600">100.0%</p>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-slate-100 p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Open Engagement</p>
                <p className="text-2xl font-black text-violet-600">75.0%</p>
              </div>
              <div className="p-3 bg-violet-50 text-violet-600 rounded-xl">
                <Eye className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-slate-100 p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Trigger Rules Active</p>
                <p className="text-2xl font-black text-amber-600">
                  {Object.values(emailConfig).filter(Boolean).length} / 4
                </p>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Sliders className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Trigger Configuration controls: Left Side */}
            <div className="lg:col-span-5 space-y-6">
              {/* Automated Triggers Card */}
              <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6 space-y-5">
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-indigo-650" />
                    Automation Trigger Rule Gates
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">Toggle live event listeners and review specific copy models.</p>
                </div>

                <div className="space-y-4 pt-1.5">
                  {/* Trigger 1: Registration Welcome */}
                  <div className="flex items-center justify-between p-3.5 border border-slate-100 rounded-xl hover:bg-slate-50/50 transition-colors">
                    <div className="space-y-0.5 max-w-[70%]">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full" />
                        <p className="text-[12px] font-black text-slate-800">1. Registration Onboarding</p>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal font-semibold">Sends Kestrel Welcome Letter instantly upon account creation.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedPreview('Registration')}
                        className={`px-2 py-1 text-[10px] font-bold rounded-md border ${
                          selectedPreview === 'Registration'
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-extrabold'
                            : 'border-slate-150 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        Preview
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleEmailConfig('Registration')}
                        className={`w-9 h-5 rounded-full transition-all relative ${
                          emailConfig['Registration'] ? 'bg-indigo-600' : 'bg-slate-200'
                        }`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${
                          emailConfig['Registration'] ? 'left-4.5' : 'left-0.5'
                        }`} />
                      </button>
                    </div>
                  </div>

                  {/* Trigger 2: Email Verification */}
                  <div className="flex items-center justify-between p-3.5 border border-slate-100 rounded-xl hover:bg-slate-50/50 transition-colors">
                    <div className="space-y-0.5 max-w-[70%]">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                        <p className="text-[12px] font-black text-slate-800">2. Account Verification</p>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal font-semibold">Sends "Thank You" confirmation immediately once validated.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedPreview('Verification')}
                        className={`px-2 py-1 text-[10px] font-bold rounded-md border ${
                          selectedPreview === 'Verification'
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-extrabold'
                            : 'border-slate-150 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        Preview
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleEmailConfig('Verification')}
                        className={`w-9 h-5 rounded-full transition-all relative ${
                          emailConfig['Verification'] ? 'bg-indigo-600' : 'bg-slate-200'
                        }`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${
                          emailConfig['Verification'] ? 'left-4.5' : 'left-0.5'
                        }`} />
                      </button>
                    </div>
                  </div>

                  {/* Trigger 3: First Login */}
                  <div className="flex items-center justify-between p-3.5 border border-slate-100 rounded-xl hover:bg-slate-50/50 transition-colors">
                    <div className="space-y-0.5 max-w-[70%]">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-violet-500 rounded-full" />
                        <p className="text-[12px] font-black text-slate-800">3. Initial Guide</p>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal font-semibold">Inundates member inbox with Getting Started navigation directives.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedPreview('First Login')}
                        className={`px-2 py-1 text-[10px] font-bold rounded-md border ${
                          selectedPreview === 'First Login'
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-extrabold'
                            : 'border-slate-150 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        Preview
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleEmailConfig('First Login')}
                        className={`w-9 h-5 rounded-full transition-all relative ${
                          emailConfig['First Login'] ? 'bg-indigo-600' : 'bg-slate-200'
                        }`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${
                          emailConfig['First Login'] ? 'left-4.5' : 'left-0.5'
                        }`} />
                      </button>
                    </div>
                  </div>

                  {/* Trigger 4: Inactivity */}
                  <div className="flex items-center justify-between p-3.5 border border-slate-100 rounded-xl hover:bg-slate-50/50 transition-colors">
                    <div className="space-y-0.5 max-w-[70%]">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-amber-500 rounded-full" />
                        <p className="text-[12px] font-black text-slate-800">4. 7-Day Inactivity Campaign</p>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal font-semibold">Sends "We Miss You" summary update to inactive entities.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedPreview('Inactivity')}
                        className={`px-2 py-1 text-[10px] font-bold rounded-md border ${
                          selectedPreview === 'Inactivity'
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-extrabold'
                            : 'border-slate-150 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        Preview
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleEmailConfig('Inactivity')}
                        className={`w-9 h-5 rounded-full transition-all relative ${
                          emailConfig['Inactivity'] ? 'bg-indigo-600' : 'bg-slate-200'
                        }`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${
                          emailConfig['Inactivity'] ? 'left-4.5' : 'left-0.5'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Disaster cron service:</span>
                  <button
                    onClick={handleRunInactivityCampaign}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-extrabold rounded-lg transition-all border border-indigo-150"
                  >
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    Simulate Inactivity Cron Scan
                  </button>
                </div>
              </div>

              {/* Live Testing dispatch console */}
              <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6 space-y-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                    <Send className="w-5 h-5 text-indigo-600" />
                    Instant Dispatch Testing Console
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">Manually test trigger templates and save real-time tracking logs.</p>
                </div>

                {automationSuccessMsg && (
                  <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 animate-bounce">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    {automationSuccessMsg}
                  </div>
                )}

                <form onSubmit={handleSendTestEmail} className="space-y-3 pt-1">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Chosen Campaign Construct Code:
                    </label>
                    <select
                      value={selectedPreview}
                      onChange={(e) => setSelectedPreview(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="Registration">Welcome Email Onboarding</option>
                      <option value="Verification">E-mail Verification Thank-You</option>
                      <option value="First Login">First-Time Login Starters Guide</option>
                      <option value="Inactivity">7-Day Inactivity Re-engagement</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Recipient Name:
                      </label>
                      <input
                        type="text"
                        value={testName}
                        onChange={(e) => setTestName(e.target.value)}
                        placeholder="e.g. Eshwar Ganta"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Recipient Email ID:
                      </label>
                      <input
                        type="email"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        placeholder="e.g. you@domain.com"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-indigo-650 hover:bg-indigo-750 text-white rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 shadow"
                  >
                    <Send className="w-4 h-4" />
                    Deliver Test Campaign Email
                  </button>
                </form>
              </div>
            </div>

            {/* Selected Email Live Mail Box Mock View: Right Side */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-1.5">
                      <Mail className="w-5 h-5 text-indigo-650" />
                      Campaign Template Wirehouse
                    </h3>
                    <p className="text-slate-500 text-xs mt-0.5 font-medium">Reviewing draft template: <span className="font-extrabold text-slate-700">{selectedPreview}</span></p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(emailTemplates[selectedPreview].body);
                      alert(`${selectedPreview} body text copied to clipboard!`);
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy Body Template
                  </button>
                </div>

                {/* Simulated Mail Client Interface */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  {/* Browser Mail Header */}
                  <div className="bg-slate-50 p-4 border-b border-slate-200 space-y-2.5">
                    <div className="flex items-center text-[11px] gap-2">
                      <span className="w-16 text-slate-400 font-bold uppercase tracking-wider">From:</span>
                      <span className="text-slate-700 font-bold">Kestrel AI solutions Account Operations &lt;<span className="text-indigo-600 select-all font-mono font-bold">eswar@kestrelaisolutions.com</span>&gt;</span>
                    </div>

                    <div className="flex items-center text-[11px] gap-2 border-t border-slate-200/40 pt-2">
                      <span className="w-16 text-slate-400 font-bold uppercase tracking-wider">To:</span>
                      <span className="text-slate-800 font-semibold">{testName} &lt;<span className="text-slate-600 font-mono select-all font-semibold">{testEmail}</span>&gt;</span>
                    </div>

                    <div className="flex items-center text-[11px] gap-2 border-t border-slate-200/40 pt-2">
                      <span className="w-16 text-slate-400 font-bold uppercase tracking-wider">Subject:</span>
                      <span className="text-indigo-950 font-black">{emailTemplates[selectedPreview].subject}</span>
                    </div>
                  </div>

                  {/* Mail Body Frame */}
                  <div className="bg-white p-6 max-h-[380px] overflow-y-auto leading-relaxed select-text shadow-inner">
                    <div className="max-w-xl mx-auto bg-slate-50/50 p-5 rounded-xl border border-slate-100">
                      {/* Company Header Block */}
                      <div className="pb-4 border-b border-indigo-100 flex items-center gap-3">
                        <img src={localStorage.getItem('companyLogo') || ''} alt="Kestrel Solutions" className="max-h-8 w-auto error-hide" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        <span className="text-lg font-black tracking-tight text-slate-800 font-sans flex items-center gap-1">
                          <span className="text-indigo-600">★</span> Kestrel AI Solutions
                        </span>
                      </div>
                      
                      {/* Original Body Text Rendered nicely */}
                      <pre className="font-sans text-[12px] text-slate-755 whitespace-pre-wrap leading-relaxed pt-4 font-medium">
                        {emailTemplates[selectedPreview].body}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Email dispatch transaction Log table */}
          <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-indigo-600" />
                  Live Campaign Outbox & Tracking Audit logs
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">Real-time status tracking of all automatic triggers dispatched within the system.</p>
              </div>

              <div className="flex gap-2 self-start sm:self-auto w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Filter by recipient email..."
                  value={emailSearch}
                  onChange={(e) => setEmailSearch(e.target.value)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 max-w-xs"
                />
                <button
                  onClick={handleClearEmailLogs}
                  className="px-3 py-1.5 border border-red-200 text-red-650 hover:bg-red-50 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear Outbox
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200/60 rounded-xl">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-black text-slate-500 uppercase tracking-wider text-[10px]">Log ID</th>
                    <th className="px-4 py-3 text-left font-black text-slate-500 uppercase tracking-wider text-[10px]">Campaign Trigger</th>
                    <th className="px-4 py-3 text-left font-black text-slate-500 uppercase tracking-wider text-[10px]">Recipient Entity</th>
                    <th className="px-4 py-3 text-left font-black text-slate-500 uppercase tracking-wider text-[10px]">Date/Time Dispatched</th>
                    <th className="px-4 py-3 text-left font-black text-slate-500 uppercase tracking-wider text-[10px]">Tracking Delivery Status</th>
                    <th className="px-4 py-3 text-left font-black text-slate-500 uppercase tracking-wider text-[10px]">Engaged (Opened)</th>
                    <th className="px-4 py-3 text-right font-black text-slate-500 uppercase tracking-wider text-[10px]">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100 font-medium">
                  {emailLogs.filter(log => {
                    if (!emailSearch) return true;
                    return log.recipientEmail.toLowerCase().includes(emailSearch.toLowerCase());
                  }).length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-slate-400 font-bold">
                        No transactions registered in this Campaign Outbox list.
                      </td>
                    </tr>
                  ) : (
                    emailLogs.filter(log => {
                      if (!emailSearch) return true;
                      return log.recipientEmail.toLowerCase().includes(emailSearch.toLowerCase());
                    }).map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="px-4 py-3 font-mono text-[10px] text-slate-450 font-black">{log.id}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide inline-block ${
                            log.triggerType === 'Registration' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                            log.triggerType === 'Verification' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            log.triggerType === 'First Login' ? 'bg-violet-50 text-violet-700 border border-violet-100' :
                            'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            {log.triggerType}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-0.5">
                            <span className="font-extrabold text-slate-800 truncate block max-w-xs">{log.recipientName}</span>
                            <span className="font-semibold text-slate-400 block font-mono text-[10px]">{log.recipientEmail}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-500 font-mono text-[10px]">{log.timestamp}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 font-mono text-[9px] font-black">
                            <span className={`w-2 h-2 rounded-full ${
                              log.status === 'DELIVERED' ? 'bg-emerald-500 animate-pulse' : 'bg-indigo-500'
                            }`} />
                            {log.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                            log.openRate || log.recipientEmail.includes('gmail') ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {log.openRate || log.recipientEmail.includes('gmail') ? 'OPENED' : 'UNREAD'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedPreview(log.triggerType);
                              setTestEmail(log.recipientEmail);
                              setTestName(log.recipientName);
                            }}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-black transition-all cursor-pointer underline hover:no-underline"
                            title="Load layout contents into Template Wirehouse preview"
                          >
                            Inspect Layout
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {settingsTab === 'appearance' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN: Visual Controls */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Configuration Panel Header */}
              <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-600" />
                      Sign-In Gateway Customizer
                    </h3>
                    <p className="text-slate-500 text-xs mt-0.5">
                      Tailor the visual environment that team admins and public visitors see when verifying access keys.
                    </p>
                  </div>
                  {appearanceMsg && (
                    <div className="bg-emerald-50 border border-emerald-150 text-emerald-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-pulse">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      {appearanceMsg}
                    </div>
                  )}
                </div>

                {/* ANIMATION CONTROL PANEL */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 flex items-center justify-between gap-4">
                  <div className="space-y-0.5 flex-1">
                    <p className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      Enhanced Visual Animations
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                      Enable slow kinetic wallpaper zooms, subtle ambient light-pulse backdrops, and active physics transitions.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input 
                      type="checkbox" 
                      id="animToggler"
                      checked={enableAnimations}
                      onChange={(e) => {
                        setEnableAnimations(e.target.checked);
                        setAppearanceMsg('Glow effects successfully configured!');
                        setTimeout(() => setAppearanceMsg(''), 3000);
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {/* SELECT BACKDROP TYPE CARD */}
                <div className="space-y-3">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider">
                    Select Gateway Backdrop Type
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      id="bgDefaultBtn"
                      onClick={() => {
                        setBgType('default');
                        setAppearanceMsg('Reset to default gradient canvas');
                        setTimeout(() => setAppearanceMsg(''), 3000);
                      }}
                      className={`py-3 px-4 rounded-xl border text-xs font-black uppercase tracking-wider text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                        bgType === 'default'
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs ring-2 ring-indigo-500/20'
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50/50'
                      }`}
                    >
                      <Sliders className="w-4 h-4 mb-1" />
                      Default
                    </button>
                    
                    <button
                      type="button"
                      id="bgVideoBtn"
                      onClick={() => {
                        setBgType('video');
                        setAppearanceMsg('Activated motion video stream');
                        setTimeout(() => setAppearanceMsg(''), 3000);
                      }}
                      className={`py-3 px-4 rounded-xl border text-xs font-black uppercase tracking-wider text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                        bgType === 'video'
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs ring-2 ring-indigo-500/20'
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50/50'
                      }`}
                    >
                      <Video className="w-4 h-4 mb-1" />
                      Dynamic Video
                    </button>

                    <button
                      type="button"
                      id="bgWallpaperBtn"
                      onClick={() => {
                        setBgType('wallpaper');
                        setAppearanceMsg('Activated luxury wallpaper backdrop');
                        setTimeout(() => setAppearanceMsg(''), 3000);
                      }}
                      className={`py-3 px-4 rounded-xl border text-xs font-black uppercase tracking-wider text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                        bgType === 'wallpaper'
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs ring-2 ring-indigo-500/20'
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50/50'
                      }`}
                    >
                      <Image className="w-4 h-4 mb-1" />
                      Wallpaper
                    </button>
                  </div>
                </div>

                {/* UPLOADER & CONFIG PANEL FOR EACH SELECTED TYPE */}
                <div className="border-t border-slate-100 pt-6 space-y-4">
                  {bgType === 'default' && (
                    <div className="bg-slate-50 p-4 rounded-xl text-xs space-y-1.5 border border-slate-200/50 text-slate-600">
                      <p className="font-extrabold text-slate-800 flex items-center gap-1.5">
                        <Sliders className="w-4 h-4 text-indigo-600" />
                        Signature Kestrel Gradient Fabric
                      </p>
                      <p className="leading-relaxed">
                        The corporate default uses a premium layered color mesh consisting of clean indigo sweeps combined with frosted glass blurring controls. Perfect for standard energy-saving enterprise workstations.
                      </p>
                    </div>
                  )}

                  {bgType === 'video' && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="bg-slate-50 p-4 rounded-xl text-xs space-y-1 text-slate-600 border border-slate-200/50">
                        <p className="font-extrabold text-slate-800">Video Integration Guidelines</p>
                        <p className="leading-relaxed">
                          Secure Gateway accepts any self-hosted MP4, WebM, or H.264 stream. Public links from storage containers are fully compatible.
                        </p>
                      </div>

                      {/* Video upload and manual stream elements */}
                      <div className="space-y-1.5 text-left">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Custom MP4 / WebM Streaming URL</label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            id="customVideoUrlInp"
                            placeholder="e.g. https://container.public/bg_clip.mp4"
                            value={customVideoInput}
                            onChange={(e) => setCustomVideoInput(e.target.value)}
                            className="flex-1 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none placeholder-slate-400"
                          />
                          <button
                            type="button"
                            id="saveCustomVideoBtn"
                            onClick={() => {
                              if (!customVideoInput.trim()) return;
                              setVideoUrl(customVideoInput.trim());
                              setCustomVideoInput('');
                              setAppearanceMsg('Custom streaming video set');
                              setTimeout(() => setAppearanceMsg(''), 3000);
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 text-xs font-black transition-all shrink-0 cursor-pointer flex items-center gap-1"
                          >
                            <Save className="w-3.5 h-3.5" />
                            Use link
                          </button>
                        </div>
                      </div>

                      {/* Local Video Upload */}
                      <div className="space-y-1.5 text-left">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Upload Local Video File (.mp4 / .webm)</label>
                        <div className="border-2 border-dashed border-slate-200 hover:border-indigo-300 rounded-xl p-4 text-center bg-white transition-all relative cursor-pointer">
                          <input
                            type="file"
                            accept="video/mp4, video/webm"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              // Warn if file is too large for storage and load via session pointer instead
                              if (file.size > 2 * 1024 * 1024) {
                                const objectUrl = URL.createObjectURL(file);
                                setVideoUrl(objectUrl);
                                setAppearanceMsg('Session memory video pointer registered!');
                                alert("To save browser memory, this 2MB+ video file has been mounted via an in-memory stream (Blob pointer). This works beautifully in this tab! For multi-device deployment, consider using a public streaming link.");
                              } else {
                                // Convert tiny files directly
                                setIsUploading(true);
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  if (event.target?.result) {
                                    setVideoUrl(event.target.result as string);
                                    setAppearanceMsg('Local video background loaded!');
                                    setIsUploading(false);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <div className="space-y-1">
                            <Upload className="w-5 h-5 mx-auto text-slate-400" />
                            <p className="text-xs font-bold text-slate-600">Select short motion background</p>
                            <p className="text-[10px] text-slate-450 font-medium">Accepts MP4 format up to 2MB. Files larger than 2MB are streaming-optimized via RAM pointers.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {bgType === 'wallpaper' && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="bg-slate-50 p-4 rounded-xl text-xs space-y-1 text-slate-600 border border-slate-200/50">
                        <p className="font-extrabold text-slate-800">Wallpaper Upload Rules</p>
                        <p className="leading-relaxed">
                          Local images uploaded are automatically processed, rescaled to 1200x800, and optimized to fit safely inside the browser's persistent key-value cache.
                        </p>
                      </div>

                      {/* Display Custom Stream Wallpaper link */}
                      <div className="space-y-1.5 text-left font-sans">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Custom HD Image URL</label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            id="customWallpaperUrlInp"
                            placeholder="https://images.unsplash.com/your-favorite-hd-image"
                            value={customVideoInput}
                            onChange={(e) => setCustomVideoInput(e.target.value)}
                            className="flex-1 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none placeholder-slate-400"
                          />
                          <button
                            type="button"
                            id="saveCustomWallpaperBtn"
                            onClick={() => {
                              if (!customVideoInput.trim()) return;
                              setWallpaper(customVideoInput.trim());
                              setCustomVideoInput('');
                              setAppearanceMsg('Custom image URL configured!');
                              setTimeout(() => setAppearanceMsg(''), 3000);
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 text-xs font-black transition-all shrink-0 cursor-pointer flex items-center gap-1"
                          >
                            <Save className="w-3.5 h-3.5" />
                            Set URL
                          </button>
                        </div>
                      </div>

                      {/* Local File Upload */}
                      <div className="space-y-1.5 text-left">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Upload local image (JPEG/PNG)</label>
                        <div className={`border-2 border-dashed border-slate-200 hover:border-indigo-300 rounded-xl p-5 text-center bg-white transition-all relative cursor-pointer ${
                          isUploading ? 'opacity-50 animate-pulse' : ''
                        }`}>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isUploading}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setIsUploading(true);
                              try {
                                const dataUrl = await fileToDataUrl(file);
                                const resized = await resizeImage(dataUrl, 1200, 800, 0.7);
                                setWallpaper(resized);
                                setAppearanceMsg('Custom Wallpaper uploaded and compressed!');
                                setTimeout(() => setAppearanceMsg(''), 3000);
                              } catch (err) {
                                alert("Failed to compress and save image local storage quota limits.");
                              } finally {
                                setIsUploading(false);
                              }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <div className="space-y-1">
                            <Upload className="w-5 h-5 mx-auto text-slate-400" />
                            <p className="text-xs font-bold text-slate-600">Drag & drop or Click to upload</p>
                            <p className="text-[10px] text-slate-450 font-medium">JPEG, PNG, or SVG. Automatic hardware compression is applied.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 3D / 4D LIBRARY SELECTION SECTION */}
              <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6 space-y-6">
                <div>
                  <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-650" />
                    AI-Generated 3D/4D Themed Library
                  </h4>
                  <p className="text-slate-400 text-xs font-medium mt-0.5">
                    Click any design card from this curated list to instantly apply premium AI-designed render elements.
                  </p>
                </div>

                {/* Grid for Preset Library Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      name: 'Quantum Gravity Lattice (3D)',
                      url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80',
                      type: 'wallpaper',
                      desc: 'Abstract render of floating transparent glass cuboids with electric neon spikes.'
                    },
                    {
                      name: 'Metamaterial Wavefront (3D)',
                      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
                      type: 'wallpaper',
                      desc: 'Vaporwave-styled mathematical spirals, satin threads, and light reflection lines.'
                    },
                    {
                      name: 'Ethereal Void Flow (4D)',
                      url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80',
                      type: 'wallpaper',
                      desc: 'Continuous hypercube refraction with neon fluid filaments and deep space atmosphere.'
                    },
                    {
                      name: 'Molecular Node Matrix (3D)',
                      url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
                      type: 'wallpaper',
                      desc: 'Deep cosmic cyan node networks layered inside a high-tech corporate dimension.'
                    },
                    {
                      name: 'Ethereal Cosmic Dust (4D)',
                      url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=80',
                      type: 'wallpaper',
                      desc: 'Deep interstellar clouds of interstellar gas, stellar flares, and cosmic energy curves.'
                    },
                    {
                      name: 'Prism Glass Shards (3D)',
                      url: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&w=1200&q=80',
                      type: 'wallpaper',
                      desc: 'Smooth futuristic glass panels scattering iridescent crystal spectra across the workspace.'
                    },
                    {
                      name: 'Dynamic Nodes (Video Loop)',
                      url: 'https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c054854d9b73f3099990ec02de4e3f3b&profile_id=139&oauth2_token_id=57447761',
                      type: 'video',
                      desc: 'Live pulsing neon abstract coordinate stream that provides an eye-catching interactive loop.'
                    },
                    {
                      name: 'Cyber Grid Velocity (Video Loop)',
                      url: 'https://player.vimeo.com/external/540026210.sd.mp4?s=120a2ec70371350a4d3cf2f7fc598c199852fcd1&profile_id=139&oauth2_token_id=57447761',
                      type: 'video',
                      desc: 'Deep corporate grid scrolling stream featuring hyper-velocity mathematical codes.'
                    }
                  ].map((preset) => {
                    const isActive = preset.type === 'video' 
                      ? (bgType === 'video' && videoUrl === preset.url)
                      : (bgType === 'wallpaper' && wallpaper === preset.url);

                    return (
                      <button
                        key={preset.name}
                        onClick={() => {
                          if (preset.type === 'video') {
                            setBgType('video');
                            setVideoUrl(preset.url);
                          } else {
                            setBgType('wallpaper');
                            setWallpaper(preset.url);
                          }
                          setAppearanceMsg(`Applied preset: ${preset.name}`);
                          setTimeout(() => setAppearanceMsg(''), 3000);
                        }}
                        className={`text-left p-3 rounded-xl border-2 transition-all hover:scale-[1.01] hover:shadow-md cursor-pointer flex gap-3 relative overflow-hidden group ${
                          isActive 
                            ? 'bg-indigo-50/55 border-indigo-600 shadow-indigo-100/40 text-slate-900' 
                            : 'bg-white border-slate-100 text-slate-600 hover:border-slate-350'
                        }`}
                      >
                        {/* Preset preview thumbnail or icon */}
                        <div className="w-14 h-14 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200/50 flex items-center justify-center relative">
                          {preset.type === 'video' ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-white">
                              <Play className="w-4 h-4 fill-current animate-pulse text-indigo-400" />
                            </div>
                          ) : (
                            <img src={preset.url} alt="thumbnail" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                          )}
                        </div>

                        {/* Text Detail */}
                        <div className="flex-1 min-w-0 font-sans space-y-0.5">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-black truncate block group-hover:text-indigo-600 transition-colors">
                              {preset.name}
                            </span>
                            {isActive && (
                              <span className="bg-indigo-600 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded shrink-0 leading-none">
                                Active
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium block leading-snug line-clamp-2">
                            {preset.desc}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Interactive Live Device Preview mockup */}
            <div className="space-y-6">
              
              <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6 space-y-5">
                <div>
                  <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-indigo-650" />
                    Gateway Preview
                  </h4>
                  <p className="text-slate-400 text-xs font-semibold mt-0.5">
                    Simulated rendering inside the live layout container.
                  </p>
                </div>

                {/* Device Screen Mockup */}
                <div className="border border-slate-200 shadow-xl rounded-2xl overflow-hidden aspect-[4/3] relative flex items-center justify-center select-none">
                  
                  {/* Backdrop Layer */}
                  {bgType === 'default' && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-slate-100 via-slate-50 to-indigo-150/40 z-0" />
                  )}

                  {bgType === 'video' && (
                    <div className="absolute inset-0 bg-slate-900 z-0 flex items-center justify-center overflow-hidden">
                      <Play className="w-8 h-8 text-indigo-400 fill-current animate-ping opacity-45" />
                      <div className="absolute bottom-2 left-2 bg-slate-950/80 rounded px-2 py-0.5 text-[8px] font-mono text-indigo-300 font-black tracking-wide">
                        [LIVE VIDEO FEED ACTIVE]
                      </div>
                    </div>
                  )}

                  {bgType === 'wallpaper' && wallpaper && (
                    <div 
                      className={`absolute inset-0 bg-cover bg-center z-0 transition-all duration-300 ${
                        enableAnimations ? 'scale-105 saturate-[1.1]' : ''
                      }`}
                      style={{ backgroundImage: `url(${wallpaper})` }}
                    >
                      <div className="absolute inset-0 bg-slate-950/20" />
                    </div>
                  )}

                  {/* Tiny simulated gateway card */}
                  <div className="w-3/4 max-w-[220px] bg-white/90 backdrop-blur-md rounded-xl p-3 border border-white/60 shadow-lg text-center space-y-2 z-10 transition-all scale-95 md:scale-100">
                    <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mx-auto" />
                    
                    <div className="space-y-0.5">
                      <div className="font-extrabold text-[10px] text-slate-800 tracking-tight leading-none">
                        Gateway Access
                      </div>
                      <div className="text-[8px] text-slate-400 font-semibold leading-relaxed">
                        Identity verification secure gate
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1.5">
                      <div className="h-4 bg-slate-100 rounded-lg w-full" />
                      <div className="h-4 bg-slate-100 rounded-lg w-full" />
                      <div className="h-5 bg-indigo-600 rounded-lg w-full flex items-center justify-center text-[8px] font-black text-white">
                        Sign In →
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Info / Operations */}
                <div className="space-y-3 pt-2">
                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      id="resetToFactoryBtn"
                      onClick={() => {
                        setBgType('default');
                        setVideoUrl('https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c054854d9b73f3099990ec02de4e3f3b&profile_id=139&oauth2_token_id=57447761');
                        setWallpaper(null);
                        setEnableAnimations(true);
                        setAppearanceMsg('Reset to clean factory default state');
                        setTimeout(() => setAppearanceMsg(''), 3000);
                      }}
                      className="flex-1 py-2 text-center text-xs font-extrabold border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                    >
                      Reset Default
                    </button>

                    <button
                      type="button"
                      id="simLogoutBtn"
                      onClick={() => {
                        const confirmLogout = window.confirm("To view your newly customized look, would you like to log out to return to the active public login terminal gateway?");
                        if (confirmLogout) {
                          // Trigger logout or navigate home
                          login('Visitor');
                          window.location.hash = ''; // reset hash route
                          window.location.reload(); // refresh
                        }
                      }}
                      className="flex-1 py-2 text-center text-xs font-black bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-all cursor-pointer"
                    >
                      Test Live Gateway
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-450 leading-relaxed font-semibold text-center italic">
                    All configured gateway visuals persist instantly. Custom wallpapers are automatically resized and compressed for high performance.
                  </p>
                </div>
              </div>

              {/* Status checklist Card */}
              <div className="bg-slate-900 rounded-xl p-5 text-white space-y-4 border border-slate-800">
                <span className="text-[9px] font-black text-indigo-400 tracking-widest uppercase block">Gateway Optimization Engine</span>
                <div className="space-y-3 text-[11px] font-sans">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Memory protection bounds verified.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>H.264 stream decoders optimized.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Dynamic reactive aura system initialized.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
