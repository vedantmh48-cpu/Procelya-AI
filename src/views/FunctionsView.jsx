import { useEffect, useState } from 'react'
import { Search, Plus, Code2, Play, Zap, Bell, Mail, Webhook, Settings2, FileText, Pencil, Trash2, Pause } from 'lucide-react'
import api from '../api/client'

const icons = { Mail, Webhook, FileText, Code2, Bell, Settings2 }

export default function FunctionsView({ onNavigate }) {
  const [functions, setFunctions] = useState([])
  const [operations, setOperations] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.listFunctions()
        setFunctions(data.functions || [])
        setOperations(data.operations || [])
      } catch (err) {
        console.error('Failed to load functions:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const allItems = [
    ...functions.map(f => ({ name: f, type: 'Function', icon: 'Code2', status: 'active' })),
    ...operations.map(o => ({ name: o, type: 'Operation', icon: 'Settings2', status: 'active' }))
  ]

  const filtered = allItems.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'All' || f.type === filter
    return matchesSearch && matchesFilter
  })

  return <div className="view-page">
    <div className="dash-head">
      <div><h1>Functions</h1><p>Reusable code blocks for your workflows.</p></div>
      <button className="flame-btn" onClick={() => onNavigate('Workflow Builder')}><Code2 size={15}/>New Function</button>
    </div>

    <div className="toolbar">
      <div className="search-box">
        <Search size={15}/>
        <input placeholder="Search functions..." value={search} onChange={e => setSearch(e.target.value)}/>
      </div>
      <div className="filter-tabs">
        {['All', 'Function', 'Operation'].map(f => (
          <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>
    </div>

    {loading ? <div className="empty-state"><p>Loading functions...</p></div> : (
      <div className="func-grid">
        {filtered.map(fn => {
          const Icon = icons[fn.icon] || Code2
          return <div className={`func-card ${fn.status}`} key={fn.name}>
            <div className="func-head">
              <span className="func-icon"><Icon size={17}/></span>
              <span className={`wf-status ${fn.status}`}>{fn.status}</span>
              <div className="func-actions">
                <button className="icon-btn" onClick={() => onNavigate('Workflow Builder')} title="Edit"><Pencil size={13}/></button>
              </div>
            </div>
            <div className="func-body">
              <h3>{fn.name}</h3>
              <p>{fn.type} handler registered in the backend function registry.</p>
            </div>
            <div className="func-chips">
              <span className="chip"><Code2 size={11}/>nodejs</span>
              <span className="chip">{fn.type}</span>
              <span className="chip"><Zap size={11}/>safe registry</span>
            </div>
          </div>
        })}
      </div>
    )}
    {!loading && !filtered.length && <div className="empty-state"><p>No functions found.</p></div>}
  </div>
}