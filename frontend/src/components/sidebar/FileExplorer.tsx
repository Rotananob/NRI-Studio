import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, File, Folder, Plus, Loader2, FilePlus } from 'lucide-react';
import { projectsApi } from '../../api/files.api';
import { Project, File as ProjectFile } from '../../types/file.types';
import { useEditorStore } from '../../store/editorStore';

const FileExplorer: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const { openTab } = useEditorStore();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectsApi.getAll();
      setProjects(data);
      if (data.length > 0) {
        setExpandedProjects(new Set([data[0]._id]));
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleProject = (projectId: string) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
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
      setProjects([...projects, newProj]);
      setExpandedProjects(new Set([...expandedProjects, newProj._id]));
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };

  const handleCreateFile = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation(); // Prevent folder toggle
    const fileName = prompt('Enter file name (e.g., index.js):');
    if (!fileName) return;
    
    // Determine language by extension
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
      await loadProjects(); // Refresh to get the new file
      
      // Auto open it
      openTab({
        id: `${projectId}-${fileName}`,
        projectId: projectId,
        label: fileName,
        filePath: fileName,
        content: '// New file\n',
        language,
        isDirty: false,
      });
      
      // Ensure folder is expanded
      setExpandedProjects(new Set([...expandedProjects, projectId]));
    } catch (err) {
      console.error('Failed to create file:', err);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}><Loader2 size={20} className="spinner" /></div>;
  }

  return (
    <div style={{ padding: '10px 0', fontSize: '13px', color: 'var(--text-main)', height: '100%', overflowY: 'auto' }}>
      <div style={{ padding: '0 15px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Projects</span>
        <button onClick={handleCreateProject} className="icon-btn" style={{ width: 'auto', height: 'auto', padding: '2px' }} title="New Project">
          <Plus size={14} />
        </button>
      </div>

      {projects.map((proj) => {
        const isExpanded = expandedProjects.has(proj._id);
        
        return (
          <div key={proj._id}>
            {/* Project Folder Row */}
            <div 
              onClick={() => toggleProject(proj._id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '4px 10px',
                cursor: 'pointer',
                backgroundColor: isExpanded ? 'var(--bg-hover)' : 'transparent',
              }}
            >
              {isExpanded ? <ChevronDown size={14} style={{ marginRight: '5px' }} /> : <ChevronRight size={14} style={{ marginRight: '5px' }} />}
              <Folder size={14} style={{ marginRight: '5px', color: 'var(--accent-color)' }} />
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{proj.projectName}</span>
              
              <button 
                onClick={(e) => handleCreateFile(e, proj._id)}
                className="icon-btn" 
                style={{ width: 'auto', height: 'auto', padding: '2px', marginLeft: '5px' }} 
                title="New File"
              >
                <FilePlus size={14} />
              </button>
            </div>

            {/* Files List */}
            {isExpanded && (
              <div style={{ paddingLeft: '15px' }}>
                {proj.files.map((file) => (
                  <div
                    key={file.path}
                    onClick={() => handleOpenFile(proj, file)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '4px 10px 4px 25px',
                      cursor: 'pointer',
                      color: 'var(--text-muted)'
                    }}
                    className="file-row"
                  >
                    <File size={14} style={{ marginRight: '5px' }} />
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {file.path.split('/').pop()}
                    </span>
                  </div>
                ))}
                {proj.files.length === 0 && (
                  <div style={{ padding: '4px 10px 4px 25px', color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '11px' }}>
                    No files found
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
      
      {projects.length === 0 && (
        <div style={{ padding: '20px 15px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <p>No projects yet.</p>
          <button onClick={handleCreateProject} style={{ marginTop: '10px', padding: '5px 10px', background: 'var(--accent-color)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Create First Project
          </button>
        </div>
      )}
    </div>
  );
};

export default FileExplorer;
