import React, { useState } from 'react'
import { useAppDispatch } from '../hooks'
import { login } from '../features/authSlice'
import { useNavigate } from 'react-router-dom'

export default function Login({ addToast }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    try {
      await dispatch(login({ username, password })).unwrap()
      addToast('✅ Вход выполнен успешно!')
      navigate('/')
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h2>Вход</h2>
      {error && <div className="error">{error}</div>}
      <div className="form-group">
        <label>Логин</label>
        <input value={username} onChange={e => setUsername(e.target.value)} required />
      </div>
      <div className="form-group">
        <label>Пароль</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
      </div>
      <button type="submit" className="btn primary">Войти</button>
    </form>
  )
}
