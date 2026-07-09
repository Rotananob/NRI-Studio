import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronDown, Plus, Loader2, FilePlus, FileJson, FileCode, FileText, FileImage, File, Upload, X, Box } from 'lucide-react';
import { projectsApi } from '../../api/files.api';
import { Project, FileEntry as ProjectFile } from '../../types/file.types';
import { useEditorStore } from '../../store/editorStore';

const FileExplorer: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Single active workspace mode
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState({ openEditors: true, project: true });
  
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    type: 'project' | 'file';
    projectId: string;
    file?: ProjectFile;
    project?: Project;
  }>({ visible: false, x: 0, y: 0, type: 'project', projectId: '' });

  const { openTab, closeTab, tabs, activeTabId, setActiveTab } = useEditorStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProjects();
    const handleGlobalClick = () => setContextMenu((prev) => ({ ...prev, visible: false }));
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js':
        return <FileCode size={14} style={{ marginRight: '5px', color: '#f7df1e' }} />;
      case 'ts':
      case 'tsx':
        return <FileCode size={14} style={{ marginRight: '5px', color: '#3178c6' }} />;
      case 'html':
        return <FileCode size={14} style={{ marginRight: '5px', color: '#e34c26' }} />;
      case 'css':
        return <FileCode size={14} style={{ marginRight: '5px', color: '#264de4' }} />;
      case 'json':
        return <FileJson size={14} style={{ marginRight: '5px', color: '#cb3837' }} />;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'svg':
        return <FileImage size={14} style={{ marginRight: '5px', color: '#a074c4' }} />;
      case 'md':
      case 'txt':
        return <FileText size={14} style={{ marginRight: '5px', color: '#519aba' }} />;
      default:
        return <File size={14} style={{ marginRight: '5px', color: 'var(--text-muted)' }} />;
    }
  };

  const loadProjects = async (idToSelect?: string) => {
    try {
      setLoading(true);
      const data = await projectsApi.getAll();
      setProjects(data);
      if (idToSelect) setActiveProjectId(idToSelect);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFile = (project: Project, file: ProjectFile) => {
    openTab({
      id: `${project._id}-${file.path}`,
      projectId: project._id,
      label: file.path.split('/').pop() || file.path,
      filePath: file.path,
      content: file.content,
      language: file.language,
      isDirty: false,
    });
  };

  const handleCreateProject = async () => {
    const name = prompt('Enter project name:');
    if (!name) return;
    try {
      const newProj = await projectsApi.create({ projectName: name, language: 'javascript' });
      await loadProjects(newProj._id);
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };

  const handleUploadFolder = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // The first file's webkitRelativePath contains the folder name: "FolderName/file.js"
    const firstPath = files[0].webkitRelativePath || files[0].name;
    const folderName = firstPath.split('/')[0] || 'Uploaded Project';

    try {
      setLoading(true);
      const newProj = await projectsApi.create({ projectName: folderName, language: 'javascript' });
      
      // Upload files sequentially (to avoid rate limits, though parallel is faster)
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const relativePath = file.webkitRelativePath || file.name;
        // Strip the root folder name from the path for cleaner internal structure
        const pathInsideProject = relativePath.substring(folderName.length + 1) || file.name;
        
        if (file.size > 1024 * 1024) continue; // Skip files > 1MB

        const content = await file.text();
        let language = 'plaintext';
        if (file.name.endsWith('.js')) language = 'javascript';
        if (file.name.endsWith('.ts')) language = 'typescript';
        if (file.name.endsWith('.html')) language = 'html';
        if (file.name.endsWith('.css')) language = 'css';
        if (file.name.endsWith('.json')) language = 'json';

        await projectsApi.saveFile(newProj._id, { path: pathInsideProject, content, language });
      }

      await loadProjects(newProj._id);
    } catch (err) {
      console.error('Failed to upload folder:', err);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
    }
  };

  const handleCreateFile = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation(); 
    const fileName = prompt('Enter file name (e.g., index.js):');
    if (!fileName) return;
    
    let language = 'plaintext';
    if (fileName.endsWith('.js')) language = 'javascript';
    if (fileName.endsWith('.ts')) language = 'typescript';
    if (fileName.endsWith('.html')) language = 'html';
    if (fileName.endsWith('.css')) language = 'css';
    if (fileName.endsWith('.json')) language = 'json';

    try {
      await projectsApi.saveFile(projectId, {
        path: fileName,
        content: '// New file\n',
        language,
      });
      await loadProjects(); 
      
      openTab({
        id: `${projectId}-${fileName}`,
        projectId: projectId,
        label: fileName,
        filePath: fileName,
        content: '// New file\n',
        language,
        isDirty: false,
      });
      setExpandedSections(prev => ({ ...prev, project: true }));
    } catch (err) {
      console.error('Failed to create file:', err);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, type: 'project' | 'file', project: Project, file?: ProjectFile) => {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.pageX, y: e.pageY, type, projectId: project._id, project, file });
  };

  const handleRename = async () => {
    setContextMenu(prev => ({ ...prev, visible: false }));
    if (contextMenu.type === 'project' && contextMenu.project) {
      const newName = prompt('Enter new project name:', contextMenu.project.projectName);
      if (newName && newName !== contextMenu.project.projectName) {
        await projectsApi.renameProject(contextMenu.projectId, newName);
        loadProjects();
      }
    } else if (contextMenu.type === 'file' && contextMenu.file) {
      const newName = prompt('Enter new file name:', contextMenu.file.path);
      if (newName && newName !== contextMenu.file.path) {
        await projectsApi.renameFile(contextMenu.projectId, contextMenu.file.path, newName);
        const tabId = `${contextMenu.projectId}-${contextMenu.file.path}`;
        if (tabs.find(t => t.id === tabId)) closeTab(tabId);
        loadProjects();
      }
    }
  };

  const handleDelete = async () => {
    setContextMenu(prev => ({ ...prev, visible: false }));
    if (contextMenu.type === 'project' && contextMenu.project) {
      if (confirm(`Are you sure you want to delete project "${contextMenu.project.projectName}"?`)) {
        await projectsApi.delete(contextMenu.projectId);
        tabs.filter(t => t.projectId === contextMenu.projectId).forEach(t => closeTab(t.id));
        if (activeProjectId === contextMenu.projectId) setActiveProjectId(null);
        loadProjects();
      }
    } else if (contextMenu.type === 'file' && contextMenu.file) {
      if (confirm(`Are you sure you want to delete file "${contextMenu.file.path}"?`)) {
        await projectsApi.deleteFile(contextMenu.projectId, contextMenu.file.path);
        const tabId = `${contextMenu.projectId}-${contextMenu.file.path}`;
        closeTab(tabId);
        loadProjects();
      }
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}><Loader2 size={20} className="spinner" /></div>;
  }

  // Find the active project object
  const activeProject = projects.find(p => p._id === activeProjectId);

  return (
    <div style={{ padding: '0', fontSize: '13px', color: 'var(--text-main)', height: '100%', overflowY: 'auto' }}>
      {/* NO ACTIVE PROJECT - SHOW PROJECT LIST */}
      {!activeProject && (
        <div style={{ padding: '15px' }}>
          <h4 style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '15px' }}>Your Projects</h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {projects.map(proj => (
              <div 
                key={proj._id}
                onClick={() => setActiveProjectId(proj._id)}
                onContextMenu={(e) => handleContextMenu(e, 'project', proj)}
                style={{ 
                  display: 'flex', alignItems: 'center', padding: '8px 10px', 
                  backgroundColor: 'var(--bg-hover)', borderRadius: '4px', cursor: 'pointer' 
                }}
              >
                <Box size={16} style={{ marginRight: '10px', color: 'var(--accent-color)' }} />
                <span style={{ flex: 1, fontWeight: 500 }}>{proj.projectName}</span>
              </div>
            ))}
          </div>

          {projects.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center', marginTop: '20px' }}>No projects found.</p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
            <button 
              onClick={handleCreateProject}
              style={{ padding: '8px', background: 'var(--accent-color)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}
            >
              <Plus size={16} /> New Project
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              style={{ padding: '8px', background: 'var(--bg-hover)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}
            >
              <Upload size={16} /> Upload Folder
            </button>
            {/* hidden file input for folder upload */}
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleUploadFolder} 
              // @ts-ignore (webkitdirectory is standard but often missing in React types)
              webkitdirectory="true" 
              directory="true" 
              multiple 
            />
          </div>
        </div>
      )}

      {/* ACTIVE PROJECT VIEW (VSCODE STYLE) */}
      {activeProject && (
        <div>
          {/* OPEN EDITORS ACCORDION */}
          <div>
            <div 
              onClick={() => setExpandedSections(prev => ({ ...prev, openEditors: !prev.openEditors }))}
              style={{ display: 'flex', alignItems: 'center', padding: '4px 10px', cursor: 'pointer', backgroundColor: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border-color)', borderTop: '1px solid var(--border-color)' }}
            >
              {expandedSections.openEditors ? <ChevronDown size={14} style={{ marginRight: '5px' }} /> : <ChevronRight size={14} style={{ marginRight: '5px' }} />}
              <span style={{ fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-main)' }}>Open Editors</span>
            </div>
            
            {expandedSections.openEditors && (
              <div style={{ padding: '5px 0' }}>
                {tabs.map(tab => (
                  <div
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      display: 'flex', alignItems: 'center', padding: '4px 10px 4px 25px', cursor: 'pointer',
                      backgroundColor: activeTabId === tab.id ? 'var(--bg-hover)' : 'transparent',
                      color: activeTabId === tab.id ? 'var(--text-main)' : 'var(--text-muted)'
                    }}
                    className="file-row"
                  >
                    <X size={14} onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }} style={{ marginRight: '5px', opacity: 0.6 }} />
                    {getFileIcon(tab.label)}
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tab.label}
                    </span>
                  </div>
                ))}
                {tabs.length === 0 && <div style={{ padding: '4px 25px', color: 'var(--text-muted)', fontSize: '11px', fontStyle: 'italic' }}>No open editors</div>}
              </div>
            )}
          </div>

          {/* PROJECT FILES ACCORDION */}
          <div>
            <div 
              onClick={() => setExpandedSections(prev => ({ ...prev, project: !prev.project }))}
              onContextMenu={(e) => handleContextMenu(e, 'project', activeProject)}
              style={{ display: 'flex', alignItems: 'center', padding: '4px 10px', cursor: 'pointer', backgroundColor: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border-color)' }}
              className="project-header"
            >
              {expandedSections.project ? <ChevronDown size={14} style={{ marginRight: '5px' }} /> : <ChevronRight size={14} style={{ marginRight: '5px' }} />}
              <span style={{ flex: 1, fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activeProject.projectName}
              </span>
              <div style={{ display: 'flex', gap: '2px' }}>
                <button onClick={(e) => handleCreateFile(e, activeProject._id)} className="icon-btn" style={{ width: 'auto', height: 'auto', padding: '2px' }} title="New File">
                  <FilePlus size={14} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); setActiveProjectId(null); }} className="icon-btn" style={{ width: 'auto', height: 'auto', padding: '2px', marginLeft: '5px' }} title="Close Project">
                  <X size={14} />
                </button>
              </div>
            </div>

            {expandedSections.project && (
              <div style={{ padding: '5px 0' }}>
                {activeProject.files.map(file => (
                  <div
                    key={file.path}
                    onClick={() => handleOpenFile(activeProject, file)}
                    onContextMenu={(e) => handleContextMenu(e, 'file', activeProject, file)}
                    style={{
                      display: 'flex', alignItems: 'center', padding: '4px 10px 4px 25px', cursor: 'pointer',
                      color: 'var(--text-muted)'
                    }}
                    className="file-row"
                  >
                    {getFileIcon(file.path.split('/').pop() || '')}
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {file.path.split('/').pop()}
                    </span>
                  </div>
                ))}
                {activeProject.files.length === 0 && (
                  <div style={{ padding: '4px 25px', color: 'var(--text-muted)', fontSize: '11px', fontStyle: 'italic' }}>
                    No files found. Click + to create one.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom Context Menu */}
      {contextMenu.visible && (
        <div 
          style={{
            position: 'absolute', top: contextMenu.y, left: contextMenu.x,
            backgroundColor: '#252526', border: '1px solid #454545',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)', zIndex: 1000,
            padding: '5px 0', borderRadius: '4px', minWidth: '150px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            onClick={handleRename}
            style={{ padding: '8px 15px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0060a0')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            Rename {contextMenu.type === 'project' ? 'Project' : 'File'}
          </div>
          <div 
            onClick={handleDelete}
            style={{ padding: '8px 15px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#f48771' }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0060a0')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            Delete {contextMenu.type === 'project' ? 'Project' : 'File'}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileExplorer;
