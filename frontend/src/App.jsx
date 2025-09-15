import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Files from './pages/Files'
import Admin from './pages/Admin'
import NavBar from './components/NavBar'
import Toast from './components/Toast'
import { useSelector, useDispatch } from 'react-redux'
import { fetchMe } from './features/authSlice'

export default function App() {
  const auth = useSelector(s => s.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [toasts, setToasts] = useState([])

  const addToast = (msg) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, msg }])
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  useEffect(() => {
    dispatch(fetchMe())
  }, [dispatch])

  useEffect(() => {
    if (auth.user && window.location.pathname === '/login') {
      navigate('/files')
    }
  }, [auth.user, navigate])

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 16 }}>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home addToast={addToast} />} />
        <Route path="/login" element={<Login addToast={addToast} />} />
        <Route path="/register" element={<Register addToast={addToast} />} />
        <Route path="/files" element={auth.user ? <Files addToast={addToast} /> : <Navigate to="/login" />}/>
        <Route path="/admin" element={auth.user?.is_admin ? <Admin /> : <Navigate to="/" />} />
      </Routes>

      {/* Уведомления */}
      <div className="toast-container">
        {toasts.map(t => (
          <Toast key={t.id} message={t.msg} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </div>
  )
}
