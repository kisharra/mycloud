// src/pages/Home.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'

export default function Home() {
  const { user } = useSelector(s => s.auth)

  return (
    <div className="home-container">
      <h1 className="home-title">MyCloud</h1>
      <p className="home-subtitle">
        Простое облачное хранилище: загрузка, просмотр, скачивание, 
        переименование и публичные ссылки.
      </p>

      {!user && (
        <div className="home-actions">
          <Link to="/register" className="btn primary">Регистрация</Link>
          <Link to="/login" className="btn secondary">Вход</Link>
        </div>
      )}

      {user && (
        <div className="home-actions">
          <p className="welcome-text">👋 Привет, <b>{user.username}</b>!</p>
          <Link to="/files" className="btn primary large">
            Перейти к файлам
          </Link>
        </div>
      )}
    </div>
  )
}
