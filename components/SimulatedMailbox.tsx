import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, X, Check, Eye, Inbox } from 'lucide-react';
import { EmailLog } from '../types';
import { getEmailLogs } from '../utils/emailAutomation';

export const SimulatedMailbox: React.FC = () => {
  const [inboxOpen, setInboxOpen] = useState(false);
  const [emails, setEmails] = useState<EmailLog[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailLog | null>(null);
  const [toastEmail, setToastEmail] = useState<EmailLog | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load existing logs on mount and listen for real-time dispatches
  useEffect(() => {
    // Set initial emails
    const existingLogs = getEmailLogs();
    setEmails(existingLogs);
    
    const handleNewEmail = (e: Event) => {
      const customEvent = e as CustomEvent<EmailLog>;
      const newEmail = customEvent.detail;
      
      setEmails(prev => [newEmail, ...prev]);
      setToastEmail(newEmail);
      setShowToast(true);
      setUnreadCount(prev => prev + 1);

      // Auto dismiss toast after 9 seconds if not opened
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 9000);

      return () => clearTimeout(timer);
    };

    window.addEventListener('email-triggered', handleNewEmail);
    return () => {
      window.removeEventListener('email-triggered', handleNewEmail);
    };
  }, []);

  const handleOpenToastEmail = () => {
    if (toastEmail) {
      setSelectedEmail(toastEmail);
      setInboxOpen(true);
      setShowToast(false);
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const handleSelectEmail = (email: EmailLog) => {
    setSelectedEmail(email);
  };

  const handleOpenInbox = () => {
    setInboxOpen(true);
    setUnreadCount(0); // Reset unread badge on click
    if (emails.length > 0 && !selectedEmail) {
      setSelectedEmail(emails[0]);
    }
  };

  return (
    <>
      {/* Floating Action Button (FAB) for Mail Hub */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={handleOpenInbox}
          className="relative flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-indigo-600 via-indigo-700 to-indigo-800 text-white rounded-full shadow-lg shadow-indigo-200 hover:scale-105 active:scale-95 transition-all duration-300 pointer-events-auto cursor-pointer group"
          title="Kestrel Mail Simulation Hub - Click to view real-time email triggers"
        >
          <Inbox className="w-6 h-6 animate-pulse group-hover:rotate-12 transition-transform duration-300" />
          
          <span className="absolute -top-1 -right-1 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-[10px] font-black text-white items-center justify-center">
              {unreadCount > 0 ? unreadCount : emails.filter(em => em.status === 'SENT').length || '1'}
            </span>
          </span>

          {/* Prompt tooltip */}
          <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none tracking-wide">
            Mail Agent Hub
          </span>
        </button>
      </div>

      {/* Real-time Toast Slide-in Notification */}
      <AnimatePresence>
        {showToast && toastEmail && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-50 w-full max-w-sm bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-800 overflow-hidden pointer-events-auto"
          >
            {/* Ambient Progress bar */}
            <motion.div 
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 9, ease: 'linear' }}
              className="h-1 bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853]"
            />
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                    <Mail className="w-5 h-5 text-indigo-400 animate-bounce" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">EMAIL TRIGGERED</span>
                    <h4 className="text-xs font-semibold text-slate-400 truncate max-w-[200px]">via: {toastEmail.senderEmail}</h4>
                  </div>
                </div>
                <button 
                  onClick={() => setShowToast(false)}
                  className="p-1 text-slate-500 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3 space-y-1">
                <p className="text-sm font-extrabold text-slate-100">{toastEmail.subject}</p>
                <p className="text-xs text-slate-400">
                  To: <span className="text-indigo-300 font-semibold">{toastEmail.recipientName}</span> ({toastEmail.recipientEmail})
                </p>
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 mt-2 text-[11px] text-slate-300 italic line-clamp-2 leading-relaxed">
                  "{toastEmail.body.split('\n').filter(Boolean)[1] || toastEmail.body.slice(0, 100)}..."
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2 text-xs">
                <button
                  onClick={() => setShowToast(false)}
                  className="px-3 py-1.5 bg-transparent hover:bg-slate-800 text-slate-400 hover:text-white font-bold rounded-lg transition-colors border border-slate-800"
                >
                  Dismiss
                </button>
                <button
                  onClick={handleOpenToastEmail}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-lg hover:scale-102 active:scale-98 transition-all flex items-center gap-1 shadow-sm"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Open Inbox Client
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Simulated Email Client Inbox View (Modal Drawer Overlay) */}
      <AnimatePresence>
        {inboxOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-6xl h-[85vh] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col font-sans"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
                <div className="flex items-center gap-3">
                  <div className="relative p-2 bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white rounded-xl shadow-md cursor-default">
                    <Inbox className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-black text-xl tracking-tight text-white leading-none">
                        Kestrel Simulation Mail Client
                      </span>
                      <span className="text-[10px] bg-indigo-500/10 text-indigo-400 font-black px-2 py-0.5 rounded-full border border-indigo-400/20 select-none uppercase">
                        Sandbox Mode
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">
                      Monitoring real-time business notification pipelines and system welcome campaigns
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setInboxOpen(false)}
                  className="p-2 text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800 rounded-xl transition-all border border-slate-700/50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Layout body */}
              <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar: List of emails */}
                <div className="w-full md:w-80 border-r border-slate-800 flex flex-col bg-slate-950/30">
                  <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/45">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">All Simulated Messages</span>
                    <span className="text-xs font-bold text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded-md border border-indigo-400/15">
                      {emails.length} total
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 custom-scrollbar p-2 space-y-1">
                    {emails.length === 0 ? (
                      <div className="p-8 text-center text-slate-500">
                        <Mail className="w-8 h-8 mx-auto mb-2 text-slate-700 animate-bounce" />
                        <p className="text-xs font-bold">No dispatched emails detected.</p>
                        <p className="text-[10px] text-slate-600 mt-1">Register a new profile or sign in to trigger emails immediately!</p>
                      </div>
                    ) : (
                      emails.map((em) => {
                        const isSelected = selectedEmail?.id === em.id;
                        return (
                          <button
                            key={em.id}
                            onClick={() => handleSelectEmail(em)}
                            className={`w-full text-left p-3.5 rounded-xl transition-all duration-200 border flex flex-col gap-1.5 relative ${
                              isSelected
                                ? 'bg-indigo-600/15 border-indigo-500/40 shadow-sm'
                                : 'bg-transparent border-transparent hover:bg-slate-800/30'
                            }`}
                          >
                            <div className="flex items-center justify-between pointer-events-none">
                              <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded-sm bg-slate-800 text-slate-300">
                                {em.triggerType}
                              </span>
                              <span className="text-[9px] font-semibold text-slate-505 font-mono">{em.timestamp.split(',')[1]?.trim() || em.timestamp}</span>
                            </div>

                            <div className="pointer-events-none">
                              <h5 className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                                {em.subject}
                              </h5>
                              <p className="text-[11px] text-slate-450 truncate mt-0.5 font-medium">To: {em.recipientName}</p>
                            </div>

                            <div className="flex items-center justify-between pointer-events-none mt-1">
                              <span className="text-[10px] text-slate-500 font-mono italic max-w-[130px] truncate">{em.recipientEmail}</span>
                              <span className={`text-[9px] font-black uppercase px-2 py-0.2 rounded-full flex items-center gap-0.5 ${
                                em.status === 'DELIVERED' 
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' 
                                  : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/15'
                              }`}>
                                <Check className="w-2.5 h-2.5" />
                                {em.status === 'DELIVERED' ? 'delivered' : 'sent'}
                              </span>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Right Pane: Active Email Detail */}
                <div className="flex-1 flex flex-col overflow-hidden bg-slate-900">
                  {selectedEmail ? (
                    <div className="flex-1 flex flex-col overflow-hidden">
                      {/* Email Header Panel */}
                      <div className="p-6 border-b border-slate-850 bg-slate-950/20 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-400/20 px-2.5 py-1 rounded-md">
                              {selectedEmail.triggerType} Core Simulation
                            </span>
                            <h2 className="text-lg md:text-xl font-bold text-white tracking-tight mt-2.5">
                              {selectedEmail.subject}
                            </h2>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 font-mono">{selectedEmail.timestamp}</span>
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-black select-none uppercase">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                              SMTP Simulator Verified
                            </div>
                          </div>
                        </div>

                        {/* Sender Recipient Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 font-medium">From:</span>
                            <span className="font-extrabold text-white">{selectedEmail.senderEmail}</span>
                            <span className="text-slate-400">({selectedEmail.senderEmail === 'eswar@kestrelaisolutions.com' ? 'Eshwar Ganta' : 'Kestrel Solutions'})</span>
                          </div>
                          <div className="flex items-center gap-2 md:justify-end">
                            <span className="text-slate-500 font-medium">To:</span>
                            <span className="font-extrabold text-indigo-300">{selectedEmail.recipientName}</span>
                            <span className="text-slate-400">({selectedEmail.recipientEmail})</span>
                          </div>
                        </div>
                      </div>

                      {/* Email Body Template Pane */}
                      <div className="flex-1 overflow-y-auto p-6 md:p-10 font-sans custom-scrollbar bg-slate-950/15">
                        <div className="max-w-2xl mx-auto bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                          {/* Inside Mock Template Frame */}
                          <div className="p-4 bg-slate-900 border-b border-slate-850 flex items-center justify-between select-none">
                            <div className="flex items-center gap-2">
                              <span className="text-[#4285F4] font-black text-xs">K</span>
                              <span className="text-[#EA4335] font-black text-xs">e</span>
                              <span className="text-[#FBBC05] font-black text-xs">s</span>
                              <span className="text-[#4285F4] font-black text-xs">t</span>
                              <span className="text-[#34A853] font-black text-xs">r</span>
                              <span className="text-[#EA4335] font-black text-xs">e</span>
                              <span className="text-[#4285F4] font-black text-xs">l</span>
                              <span className="mx-0.5"></span>
                              <span className="text-[#EA4335] font-black text-xs">A</span>
                              <span className="text-[#34A853] font-black text-xs">I</span>
                            </div>
                            <span className="text-[9px] text-slate-500 font-mono tracking-wider">OFFICIAL SYSTEM NOTIFICATION</span>
                          </div>
                          
                          <div className="p-6 md:p-8 text-sm text-slate-300 leading-relaxed space-y-4 whitespace-pre-line select-text">
                            {selectedEmail.body}
                          </div>

                          <div className="p-4 bg-slate-900/60 border-t border-slate-850 text-center select-none">
                            <p className="text-[10px] text-slate-500 font-medium">
                              This is a localized SMTP sandbox transaction initiated under the <strong>Kestrel AI System Trust-Chain</strong>.
                            </p>
                            <p className="text-[9px] text-slate-600 mt-0.5 font-mono">
                              Message ID: {selectedEmail.id} • Sender SMTP Handshake: AUTHENTICATE_SUCCESSFUL
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8">
                      <Mail className="w-12 h-12 mb-4 text-slate-700 animate-pulse" />
                      <h4 className="text-slate-400 font-extrabold text-sm uppercase tracking-wide">No Message Selected</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm text-center">
                        Select a transaction thread from the list on the left to read its full cryptographic metadata and message body.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Status and Footer Info */}
            <div className="px-6 py-3 border-t border-slate-800/80 bg-slate-950/70 text-xs text-slate-400 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#34A853] animate-pulse" />
                <span className="font-semibold text-[11px] text-slate-300">
                  SMTP Port 587 Sandbox: Active & Ready
                </span>
              </div>
                <div className="flex items-center gap-4 text-[10px] text-slate-500">
                  <span>Host Ingress: <strong>eswar@kestrelaisolutions.com</strong></span>
                  <span>Receiver SSL Checklist: <strong>PASSED</strong></span>
                  <span>Encryption: <strong>STARTTLS (Simulated)</strong></span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
