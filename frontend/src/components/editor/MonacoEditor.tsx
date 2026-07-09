import React, { useRef, useEffect } from 'react';
import Editor, { useMonaco, OnMount } from '@monaco-editor/react';
import { useEditorStore } from '../../store/editorStore';
import { projectsApi } from '../../api/files.api';

interface MonacoEditorProps {
  projectId?: string;
}

const MonacoEditor: React.FC<MonacoEditorProps> = ({ projectId }) => {
  const monaco = useMonaco();
  const editorRef = useRef<any>(null);
  
  const { tabs, activeTabId, updateTabContent, markTabClean, fontSize, theme } = useEditorStore();
  const activeTab = tabs.find((t) => t.id === activeTabId);

  // Auto-save logic (debounced)
  useEffect(() => {
    if (!activeTab || !activeTab.isDirty || !projectId) return;

    const saveTimer = setTimeout(async () => {
      try {
        await projectsApi.saveFile(projectId, {
          path: activeTab.filePath,
          content: activeTab.content,
          language: activeTab.language,
        });
        markTabClean(activeTab.id);
      } catch (err) {
        console.error('Failed to auto-save file:', err);
      }
    }, 1500); // Save 1.5s after user stops typing

    return () => clearTimeout(saveTimer);
  }, [activeTab?.content, activeTab?.isDirty, projectId]);

  // Configure IntelliSense
  useEffect(() => {
    if (monaco) {
      // @ts-ignore
      monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
      });

      // @ts-ignore
      monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
        // @ts-ignore
        target: monaco.languages.typescript.ScriptTarget.ES2020,
        allowNonTsExtensions: true,
        // @ts-ignore
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        // @ts-ignore
        module: monaco.languages.typescript.ModuleKind.CommonJS,
        noEmit: true,
        esModuleInterop: true,
      });
    }
  }, [monaco]);

  const handleEditorDidMount: OnMount = (editor, monacoInstance) => {
    editorRef.current = editor;
    
    // Add custom keybindings (e.g., Ctrl+S to save manually)
    editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyS, async () => {
      if (activeTab && projectId) {
        try {
          await projectsApi.saveFile(projectId, {
            path: activeTab.filePath,
            content: editor.getValue(),
            language: activeTab.language,
          });
          markTabClean(activeTab.id);
        } catch (err) {
          console.error('Failed to save file on Ctrl+S:', err);
        }
      }
    });
  };

  const handleChange = (value: string | undefined) => {
    if (value !== undefined && activeTabId) {
      updateTabContent(activeTabId, value);
    }
  };

  if (!activeTab) {
    return (
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <img src="/logo.png" alt="NRI Studio Logo" style={{ width: '100px', height: '100px', borderRadius: '15px', marginBottom: '20px', opacity: 0.2, filter: 'grayscale(50%)' }} />
        <h1 style={{ fontWeight: 400, color: 'var(--text-muted)' }}>No File is Open</h1>
        <p style={{ fontSize: '12px', color: '#555', marginTop: '10px' }}>Select a file from the explorer to start editing.</p>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, height: '100%', width: '100%' }}>
      <Editor
        height="100%"
        width="100%"
        language={activeTab.language}
        theme={theme}
        value={activeTab.content}
        onChange={handleChange}
        onMount={handleEditorDidMount}
        options={{
          fontSize,
          minimap: { enabled: false }, // Disable minimap for cleaner look, especially on small screens
          wordWrap: 'on',
          automaticLayout: true,
          padding: { top: 10 },
          scrollBeyondLastLine: false,
          fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
        }}
      />
    </div>
  );
};

export default MonacoEditor;
