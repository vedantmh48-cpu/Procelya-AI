import { useEffect, useState } from 'react'
import { Search, Plus, Folder, MoreVertical, Trash2, Zap, Users, GitBranch, Clock, Copy } from 'lucide-react'
import api from '../api/client'

export default function ProjectsView({ onNavigate }) {
  const [projects, setProjects] = useState([])
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.listProjects()
        setProjects(data)
      } catch (err) {
        console.error('Failed to load projects:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  const remove = (id) => {
    setProjects(prev => prev.filter(p => p._id !== id))
    setMenuOpen(null)
  }

  const duplicate = async (id) => {
    const proj = projects.find(p => p._id === id)
    if (!proj) return
    try {
      await api.createWorkflow({
        projectName: `${proj.name}-copy`,
        workflowName: 'Initial Workflow',
        description: 'Duplicated project workflow',
        triggerEvent: { type: 'generic.trigger', schema: 'orders' },
        steps: []
      })
      const data = await api.listProjects()
      setProjects(data)
    } catch (err) {
      console.error('Duplicate error:', err)
    }
    setMenuOpen(null)
  }

  const addProject = async () => {
    try {
      await api.createWorkflow({
        projectName: `new-project-${projects.length + 1}`,
        workflowName: 'Initial Workflow',
        description: 'New project',
        triggerEvent: { type: 'generic.trigger', schema: 'orders' },
        steps: []
      })
      const data = await api.listProjects()
      setProjects(data)
    } catch (err) {
      console.error('Add project error:', err)
    }
  }

  return <div className="view-page">
    <div className="dash-head">
      <div><h1>Projects</h1><p>Organize workflows into projects.</p></div>
      <button className="flame-btn" onClick={addProject}><Plus size={15}/>New Project</button>
    </div>

    <div className="toolbar">
      <div className="search-box">
        <Search size={15}/>
        <input placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)}/>
      </div>
    </div>

    {loading ? <div className="empty-state"><p>Loading projects...</p></div> : (
      <div className="project-grid">
        {filtered.map(proj => (
          <div className="project-card flame" key={proj._id}>
            <div className="proj-head">
              <span className="proj-icon"><Folder size={19}/></span>
              <h3>{proj.name}</h3>
              <div className="proj-menu-wrap">
                <button className="icon-btn" onClick={() => setMenuOpen(menuOpen === proj._id ? null : proj._id)}><MoreVertical size={15}/></button>
                {menuOpen === proj._id && <div className="proj-menu">
                  <button onClick={() => onNavigate('Workflow Builder')}><Zap size={13}/>Open</button>
                  <button onClick={() => duplicate(proj._id)}><Copy size={13}/>Duplicate</button>
                  <button className="danger" onClick={() => remove(proj._id)}><Trash2 size={13}/>Delete</button>
                </div>}
              </div>
            </div>
            <p className="proj-desc">{proj.desc}</p>
            <div className="proj-meta">
              <span><GitBranch size={13}/>{proj.workflows} workflows</span>
              <span><Users size={13}/>{proj.schemas?.length || 0} schemas</span>
              <span><Clock size={13}/>{proj.updated ? new Date(proj.updated).toLocaleDateString() : '—'}</span>
            </div>
            <div className="proj-foot">
              <span className="proj-status">flame</span>
              <button className="ghost" onClick={() => onNavigate('Workflow Builder')}>Open <Zap size={12}/></button>
            </div>
          </div>
        ))}
      </div>
    )}
    {!loading && !filtered.length && <div className="empty-state"><p>No projects found.</p></div>}
  </div>
}