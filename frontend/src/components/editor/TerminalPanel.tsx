import React, { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { X, Play } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { projectsApi } from '../../api/files.api';

interface TerminalPanelProps {
  onClose: () => void;
}

const TerminalPanel: React.FC<TerminalPanelProps> = ({ onClose }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  const { tabs, activeTabId } = useEditorStore();
  const activeTab = tabs.find((t) => t.id === activeTabId);

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new XTerm({
      theme: {
        background: '#1e1e1e',
        foreground: '#cccccc',
        cursor: 'transparent',
      },
      fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
      fontSize: 13,
      disableStdin: true, // Output only for now since backend is stateless exec
      cursorBlink: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    
    term.open(terminalRef.current);
    fitAddon.fit();
    
    term.writeln('\x1b[32mNRI Studio Sandbox Terminal initialized.\x1b[0m');
    term.writeln('Click "Run Code" to execute the active file.');

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    const handleResize = () => fitAddon.fit();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, []);

  const handleRunCode = async () => {
    if (!activeTab) return;
    if (!xtermRef.current) return;
    const term = xtermRef.current;

    term.writeln(`\r\n\x1b[36m> Running ${activeTab.label}...\x1b[0m`);
    
    try {
      const result = await projectsApi.execute(activeTab.content, activeTab.language as any);
      
      if (result.stdout) {
        // xterm needs \r\n for line breaks
        term.write(result.stdout.replace(/\n/g, '\r\n')); 
      }
      if (result.stderr) {
        term.write(`\x1b[31m${result.stderr.replace(/\n/g, '\r\n')}\x1b[0m`);
      }
      
      if (result.timedOut) {
        term.writeln(`\x1b[31m\r\n[Execution Timed Out]\x1b[0m`);
      } else {
        term.writeln(`\r\n\x1b[32m[Exited with code ${result.exitCode}] in ${result.executionTimeMs}ms\x1b[0m`);
      }
    } catch (err: any) {
      term.writeln(`\x1b[31m\r\nExecution failed: ${err.message}\x1b[0m`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--bg-panel)' }}>
      {/* Panel Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '0 10px',
        borderBottom: '1px solid var(--border-color)',
        height: '35px'
      }}>
        <div style={{ display: 'flex', gap: '15px' }}>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-main)', borderBottom: '1px solid var(--accent-color)', paddingBottom: '8px', cursor: 'pointer' }}>Terminal</span>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', cursor: 'pointer' }}>Output</span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={handleRunCode}
            disabled={!activeTab || (activeTab.language !== 'javascript' && activeTab.language !== 'typescript')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '5px', 
              background: 'var(--accent-color)', color: '#fff', 
              border: 'none', borderRadius: '3px', padding: '2px 8px', 
              cursor: 'pointer', fontSize: '11px' 
            }}
          >
            <Play size={12} /> Run Code
          </button>
          <button onClick={onClose} className="icon-btn" style={{ width: 'auto', height: 'auto', padding: '2px' }}>
            <X size={14} />
          </button>
        </div>
      </div>
      
      {/* xterm container */}
      <div style={{ flex: 1, padding: '10px', overflow: 'hidden' }}>
        <div ref={terminalRef} style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  );
};

export default TerminalPanel;
