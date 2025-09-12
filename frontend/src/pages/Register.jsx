import React, { useState } from 'react'
import { useAppDispatch } from '../hooks'
import { register } from '../features/authSlice'
import { useNavigate } from 'react-router-dom'

const LOGIN_RE = /^[A-Za-z][A-Za-z0-9]{3,19}$/
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
const PASSWORD_RE = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/

export default function Register({ addToast }) {
  const [form, setForm] = useState({ username: '', full_name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const v = {
    username: LOGIN_RE.test(form.username),
    email: EMAIL_RE.test(form.email),
    password: PASSWORD_RE.test(form.password),
    full_name: !!form.full_name.trim(),
  }
  const allOk = Object.values(v).every(Boolean)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await dispatch(register(form)).unwrap()
      addToast('🎉 Регистрация прошла успешно!')
      navigate('/')
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h2>Регистрация</h2>
      {error && <div className="error">{error}</div>}
      
      <div className="form-group">
        <label>Логин</label>
        <input 
          value={form.username} 
          onChange={e=>setForm({ ...form, username: e.target.value })} 
          required 
        />
        {!v.username && form.username && (
          <small className="error-text">Латиница/цифры, буква первым, 4–20</small>
        )}
      </div>

      <div className="form-group">
        <label>Полное имя</label>
        <input 
          value={form.full_name} 
          onChange={e=>setForm({ ...form, full_name: e.target.value })} 
          required 
        />
        {!v.full_name && form.full_name!=='' && (
          <small className="error-text">Укажите имя</small>
        )}
      </div>

      <div className="form-group">
        <label>Email</label>
        <input 
          type="email"
          value={form.email} 
          onChange={e=>setForm({ ...form, email: e.target.value })} 
          required 
        />
        {!v.email && form.email && (
          <small className="error-text">Некорректный email</small>
        )}
      </div>

      <div className="form-group">
        <label>Пароль</label>
        <input 
          type="password" 
          value={form.password} 
          onChange={e=>setForm({ ...form, password: e.target.value })} 
          required 
        />
        {!v.password && form.password && (
          <small className="error-text">≥6, 1 заглавная, 1 цифра, 1 спецсимвол</small>
        )}
      </div>

      <button type="submit" className="btn primary" disabled={!allOk}>
        Зарегистрироваться
      </button>
    </form>
  )
}
