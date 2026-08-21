import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const USERS_KEY = 'procelya-users'
const SESSION_KEY = 'procelya-session'

function hashPassword(password) {
  // Simple hash for demo (not for production)
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    hash = ((hash << 5) - hash) + password.charCodeAt(i)
    hash |= 0
  }
  return 'h_' + Math.abs(hash).toString(36) + '_' + password.length
}

function getUsers() {
  try {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
    // Seed demo user on first run
    if (users.length === 0) {
      const demo = {
        id: 'u_demo',
        name: 'Venkatesh M',
        email: 'admin@procelya.ai',
        password: hashPassword('admin123'),
        role: 'Admin',
        createdAt: new Date().toISOString(),
        initials: 'VM'
      }
      users.push(demo)
      saveUsers(users)
    }
    return users
  } catch {
    return []
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')
      if (session) setUser(session)
    } catch {}
    setLoading(false)
  }, [])

  const register = (name, email, password) => {
    const users = getUsers()
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { error: 'An account with this email already exists' }
    }
    const newUser = {
      id: 'u_' + Date.now().toString(36),
      name,
      email,
      password: hashPassword(password),
      role: 'Admin',
      createdAt: new Date().toISOString(),
      initials: name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    }
    users.push(newUser)
    saveUsers(users)
    const session = { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, initials: newUser.initials }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    setUser(session)
    return { success: true }
  }

  const loginWithEmail = (email, password) => {
    const users = getUsers()
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase())
    if (!found) return { error: 'No account found with this email' }
    if (found.password !== hashPassword(password)) {
      return { error: 'Incorrect password. Please try again' }
    }
    const session = { id: found.id, name: found.name, email: found.email, role: found.role, initials: found.initials }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    setUser(session)
    return { success: true }
  }

  const logout = () => {
    localStorage.removeItem(SESSION_KEY)
    setUser(null)
  }

  const updateProfile = (updates) => {
    if (!user) return
    const users = getUsers()
    const idx = users.findIndex(u => u.id === user.id)
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updates }
      saveUsers(users)
    }
    const session = { ...user, ...updates }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    setUser(session)
  }

  const changePassword = (currentPassword, newPassword) => {
    if (!user) return { error: 'Not authenticated' }
    const users = getUsers()
    const idx = users.findIndex(u => u.id === user.id)
    if (idx === -1) return { error: 'User not found' }
    if (users[idx].password !== hashPassword(currentPassword)) {
      return { error: 'Current password is incorrect' }
    }
    if (newPassword.length < 6) {
      return { error: 'New password must be at least 6 characters' }
    }
    users[idx].password = hashPassword(newPassword)
    saveUsers(users)
    return { success: true }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login: loginWithEmail, register, logout, updateProfile, changePassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext }