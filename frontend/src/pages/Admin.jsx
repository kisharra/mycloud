import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useAppDispatch } from '../hooks'
import { fetchUsers, deleteUser, toggleAdmin } from '../features/usersSlice'
import { Link } from 'react-router-dom'

export default function Admin() {
  const { items, loading } = useSelector(s => s.users)
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(fetchUsers())
  }, [dispatch])

  return (
    <div>
      <h2>Администрирование</h2>
      {loading ? (
        <p>Загрузка…</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Логин</th>
              <th>Имя</th>
              <th>Email</th>
              <th>Админ</th>
              <th>Файлов</th>
              <th>Объем</th>
              <th>Хранилище</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {items.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>{u.full_name}</td>
                <td>{u.email}</td>
                <td>{u.is_admin ? '✅' : '—'}</td>
                <td>{u.files_count}</td>
                <td>{(u.files_total / 1024).toFixed(1)} KB</td>
                <td>
                  {u.files_count > 0 ? (
                    <Link to={`/files?user_id=${u.id}&username=${u.username}`}>Управлять</Link>
                  ) : (
                    '—'
                  )}
                </td>
                <td>
                  <button onClick={() => dispatch(toggleAdmin(u.id))}>
                    Перекл. админа
                  </button>
                  <button
                    className="btn-danger"
                    onClick={() => dispatch(deleteUser(u.id))}
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
