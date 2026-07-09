import React from 'react';
import { X, Circle } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';

const TabBar: React.FC = () => {
  const { tabs, activeTabId, setActiveTab, closeTab } = useEditorStore();

  if (tabs.length === 0) return null;

  return (
    <div style={{
      display: 'flex',
      backgroundColor: 'var(--bg-sidebar)',
      overflowX: 'auto',
      borderBottom: '1px solid var(--border-color)',
      height: '35px',
      minHeight: '35px'
    }}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        
        return (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0 10px',
              backgroundColor: isActive ? 'var(--bg-tab-active)' : 'var(--bg-tab-inactive)',
              color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
              borderRight: '1px solid var(--border-color)',
              borderTop: isActive ? '1px solid var(--accent-color)' : '1px solid transparent',
              cursor: 'pointer',
              minWidth: '120px',
              maxWidth: '200px',
              fontSize: '13px'
            }}
          >
            <span style={{ 
              flex: 1, 
              whiteSpace: 'nowrap', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis',
              marginRight: '8px'
            }}>
              {tab.label}
            </span>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '2px',
                borderRadius: '3px'
              }}
              className="tab-close-btn"
            >
              {tab.isDirty ? (
                <Circle size={10} fill="currentColor" />
              ) : (
                <X size={14} />
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default TabBar;
