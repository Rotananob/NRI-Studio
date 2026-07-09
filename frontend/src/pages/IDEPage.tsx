import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { auth } from '../firebase';
import { 
  Files, 
  Search, 
  Settings, 
  LogOut, 
  TerminalSquare,
  Menu,
  X
} from 'lucide-react';
import FileExplorer from '../components/sidebar/FileExplorer';
import TabBar from '../components/tabs/TabBar';
import MonacoEditor from '../components/editor/MonacoEditor';
import TerminalPanel from '../components/editor/TerminalPanel';
import { useEditorStore } from '../store/editorStore';
import '../styles/ide.css';

const IDEPage: React.FC = () => {
  const { user, setFirebaseUser, setUser } = useAuthStore();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'explorer' | 'search' | 'settings'>('explorer');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

  React.useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ctrl+B (Toggle Sidebar)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsSidebarOpen(prev => !prev);
      }
      // Ctrl+` (Toggle Terminal)
      if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault();
        setIsTerminalOpen(prev => !prev);
      }
      // Ctrl+W (Close active tab) - Browsers often intercept this, but we try
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'w') {
        e.preventDefault();
        const state = useEditorStore.getState();
        if (state.activeTabId) {
          state.closeTab(state.activeTabId);
        }
      }
    };
    
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    setFirebaseUser(null);
    setUser(null);
    navigate('/login');
  };

  const toggleSidebar = (view: typeof activeView) => {
    if (activeView === view && isSidebarOpen) {
      setIsSidebarOpen(false);
    } else {
      setActiveView(view);
      setIsSidebarOpen(true);
    }
  };

  return (
    <div className="ide-container">
      <div className="ide-main">
        
        {/* Desktop Activity Bar */}
        <div className="ide-activity-bar">
          <div style={{ flex: 1 }}>
            <button 
              className={`icon-btn ${activeView === 'explorer' && isSidebarOpen ? 'active' : ''}`}
              onClick={() => toggleSidebar('explorer')}
              title="Explorer"
            >
              <Files size={24} />
            </button>
            <button 
              className={`icon-btn ${activeView === 'search' && isSidebarOpen ? 'active' : ''}`}
              onClick={() => toggleSidebar('search')}
              title="Search"
            >
              <Search size={24} />
            </button>
          </div>
          <div>
            <button 
              className={`icon-btn ${isTerminalOpen ? 'active' : ''}`}
              onClick={() => setIsTerminalOpen(!isTerminalOpen)}
              title="Terminal"
            >
              <TerminalSquare size={24} />
            </button>
            <button className="icon-btn" title="Settings" onClick={() => toggleSidebar('settings')}>
              <Settings size={24} />
            </button>
            <button className="icon-btn" onClick={handleLogout} title="Logout">
              <LogOut size={24} />
            </button>
          </div>
        </div>

        {/* Sidebar (File Explorer / Search) */}
        <div className={`ide-sidebar ${isSidebarOpen ? '' : 'collapsed'}`}>
          <div style={{ padding: '10px 15px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', margin: 0, fontWeight: 600 }}>
              {activeView.toUpperCase()}
            </h3>
            {/* Mobile close button inside sidebar */}
            <button 
              className="icon-btn" 
              style={{ width: 'auto', height: 'auto', padding: '5px' }} 
              onClick={() => setIsSidebarOpen(false)}
            >
              <X size={16} />
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {activeView === 'explorer' && <FileExplorer />}
            {activeView === 'search' && <div style={{ padding: '15px' }}>Search functionality coming soon...</div>}
            {activeView === 'settings' && <div style={{ padding: '15px' }}>Settings (Logged in as {user?.displayName})</div>}
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="ide-editor-area">
          {/* Mobile Top Header (only visible when sidebar is closed on mobile) */}
          <div className="ide-mobile-nav" style={{ position: 'absolute', top: 0, bottom: 'auto', height: '40px', justifyContent: 'flex-start', padding: '0 10px' }}>
            <button className="icon-btn" style={{ width: 'auto' }} onClick={() => setIsSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <span style={{ fontSize: '13px', marginLeft: '10px', fontWeight: 600 }}>NRI Studio</span>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
            <TabBar />
            <div style={{ flex: 1, position: 'relative' }}>
              <MonacoEditor projectId={useEditorStore.getState().activeTabId?.split('-')[0]} />
            </div>
            {isTerminalOpen && (
              <div style={{ height: '30%', minHeight: '200px', borderTop: '1px solid var(--border-color)' }}>
                <TerminalPanel onClose={() => setIsTerminalOpen(false)} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="ide-mobile-nav">
        <button 
          className={`icon-btn ${activeView === 'explorer' ? 'active' : ''}`}
          onClick={() => toggleSidebar('explorer')}
        >
          <Files size={20} />
        </button>
        <button 
          className={`icon-btn ${activeView === 'search' ? 'active' : ''}`}
          onClick={() => toggleSidebar('search')}
        >
          <Search size={20} />
        </button>
        <button 
          className={`icon-btn ${isTerminalOpen ? 'active' : ''}`}
          onClick={() => setIsTerminalOpen(!isTerminalOpen)}
        >
          <TerminalSquare size={20} />
        </button>
        <button className="icon-btn" onClick={handleLogout}>
          <LogOut size={20} />
        </button>
      </div>

      {/* Desktop Status Bar */}
      <div className="ide-status-bar">
        <div>
          <span style={{ marginRight: '15px' }}>NRI Studio</span>
          <span style={{ cursor: 'pointer' }}>main*</span>
        </div>
        <div>
          <span style={{ marginRight: '15px' }}>Ln 1, Col 1</span>
          <span style={{ marginRight: '15px' }}>UTF-8</span>
          <span>{user?.displayName}</span>
        </div>
      </div>
    </div>
  );
};

export default IDEPage;
