import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useAppDispatch } from '../hooks'
import { logout } from '../features/authSlice'

export default function NavBar() {
  const { user } = useSelector(s => s.auth)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const onLogout = async () => {
    await dispatch(logout())
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="left">
        <Link to="/">Главная</Link>
        {user && <Link to="/files">Файлы</Link>}
        {user?.is_admin && <Link to="/admin">Админ</Link>}
      </div>

      <div className="right">
        {!user && (
          <>
            <Link to="/login">Вход</Link>
            <Link to="/register">Регистрация</Link>
          </>
        )}
        {user && (
          <>
            <span>👤 {user.username}</span>
            <button onClick={onLogout}>Выход</button>
          </>
        )}
      </div>
    </nav>
  )
}
