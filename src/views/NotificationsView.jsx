import { useState, useEffect } from 'react'
import { Bell, CheckCircle2, AlertTriangle, Package, CreditCard, ShoppingCart, X, Check, Clock } from 'lucide-react'
import api from '../api/client'

const STATUS_ICONS = {
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Bell,
  order: ShoppingCart,
  payment: CreditCard,
  inventory: Package
}

export default function NotificationsView({ onNavigate }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [unreadCount, setUnreadCount] = useState(0)

  const seedNotifications = (workflows, runs) => {
    const now = new Date()
    const items = []

    // Generate notifications from workflows/runs
    const orderWorkflow = workflows.find(w => (w.workflowName || '').toLowerCase().includes('order'))
    const invoiceWorkflow = workflows.find(w => (w.workflowName || '').toLowerCase().includes('invoice'))
    const assetWorkflow = workflows.find(w => (w.workflowName || '').toLowerCase().includes('asset'))

    runs.forEach((run, i) => {
      const time = run.completedAt || run.startedAt || new Date(now - i * 3600000).toISOString()
      if (run.status === 'COMPLETED') {
        items.push({
          id: 'notif-run-' + run._id,
          type: 'success',
          title: 'Workflow Completed',
          message: `${run.workflowId || 'Workflow'} executed successfully in ${run.totalDuration || 0}ms`,
          time,
          read: false
        })
      }
    })

    // Order confirmation notifications
    if (orderWorkflow) {
      items.push({
        id: 'notif-order-confirm',
        type: 'order',
        title: 'Order Confirmed',
        message: 'Payment received for order ORD-2026-014. Stock type: physical. Confirmation sent to vendor and customer.',
        time: new Date(now - 25 * 60000).toISOString(),
        read: false,
        tag: 'admin'
      })
    }

    // Payment notification
    if (invoiceWorkflow) {
      items.push({
        id: 'notif-payment',
        type: 'payment',
        title: 'Payment Received',
        message: 'Invoice payment received, vendor payment released and receipt generated.',
        time: new Date(now - 45 * 60000).toISOString(),
        read: false,
        tag: 'admin'
      })
    }

    // Inventory update notification
    items.push({
      id: 'notif-inventory',
      type: 'inventory',
      title: 'Inventory Updated',
      message: 'Stock quantity updated for physical items after order confirmation. New stock level: 119 units.',
      time: new Date(now - 30 * 60000).toISOString(),
      read: false,
      tag: 'admin'
    })

    // Stock check notification
    items.push({
      id: 'notif-stock-check',
      type: 'warning',
      title: 'Stock Check Passed',
      message: 'Physical stock available for the order. Inventory has been reserved and updated.',
      time: new Date(now - 28 * 60000).toISOString(),
      read: false,
      tag: 'admin'
    })

    // Workflow creation notifications
    if (workflows.length) {
      items.push({
        id: 'notif-new-wf',
        type: 'info',
        title: 'New Workflow Created',
        message: `${workflows[0]?.workflowName || 'New workflow'} was created and published.`,
        time: new Date(now - 2 * 3600000).toISOString(),
        read: true
      })
    }

    items.sort((a, b) => new Date(b.time) - new Date(a.time))
    return items
  }

  useEffect(() => {
    const load = async () => {
      try {
        const [workflows, runs, backendNotifs] = await Promise.all([
          api.listWorkflows(),
          api.listRuns(),
          api.getNotifications().catch(() => [])
        ])
        const localItems = seedNotifications(workflows || [], runs || [])
        const allItems = [
          ...(backendNotifs || []),
          ...localItems
        ]
        // Deduplicate by id
        const seen = new Set()
        const merged = allItems.filter(n => {
          if (seen.has(n.id)) return false
          seen.add(n.id)
          return true
        })
        merged.sort((a, b) => new Date(b.time) - new Date(a.time))
        setNotifications(merged)
        setUnreadCount(merged.filter(n => !n.read).length)
      } catch (err) {
        console.error('Notifications load error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const markRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const clearAll = () => {
    setNotifications([])
    setUnreadCount(0)
  }

  const filtered = filter === 'All' ? notifications : notifications.filter(n => n.type === filter.toLowerCase())

  return <div className="view-page">
    <div className="dash-head">
      <div><h1>Notifications</h1><p>Real-time alerts for order confirmations, payments, and inventory updates.</p></div>
      <div style={{ display: 'flex', gap: 8 }}>
        {unreadCount > 0 && <button className="ghost" onClick={markAllRead}><Check size={14}/>Mark All Read</button>}
        <button className="ghost" onClick={clearAll}><X size={14}/>Clear All</button>
      </div>
    </div>

    <div className="toolbar">
      <div className="filter-tabs">
        {['All', 'Order', 'Payment', 'Inventory', 'Success', 'Warning'].map(f => (
          <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>
      {unreadCount > 0 && <span className="notif-unread">You have {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}</span>}
    </div>

    {loading ? <div className="empty-state"><p>Loading notifications...</p></div> : (
      <div className="notif-list">
        {filtered.length === 0 && <div className="empty-state"><p>No notifications found.</p></div>}
        {filtered.map(n => {
          const Icon = STATUS_ICONS[n.type] || Bell
          return <div className={`notif-card ${n.type} ${n.read ? 'read' : 'unread'}`} key={n.id} onClick={() => markRead(n.id)}>
            <span className={`notif-icon ${n.type}`}><Icon size={17}/></span>
            <div className="notif-body">
              <div className="notif-top">
                <strong>{n.title}</strong>
                <small><Clock size={11}/>{new Date(n.time).toLocaleString()}</small>
              </div>
              <p>{n.message}</p>
              {n.tag && <span className="notif-tag">{n.tag}</span>}
            </div>
            {!n.read && <span className="notif-dot"/>}
          </div>
        })}
      </div>
    )}
  </div>
}