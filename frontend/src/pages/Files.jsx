import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useAppDispatch } from '../hooks'
import { fetchFiles, upload } from '../features/filesSlice'
import FileRow from '../components/FileRow'
import { useLocation } from 'react-router-dom'

export default function Files({ addToast }) {  // 🔹 принимаем addToast
  const { items, loading } = useSelector(s => s.files)
  const [file, setFile] = useState(null)
  const [comment, setComment] = useState('')
  const dispatch = useAppDispatch()
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const userId = params.get('user_id')
  const username = params.get('username')

  useEffect(() => {
    dispatch(fetchFiles(userId))
  }, [dispatch, userId])

  return (
    <div>
      <h2>
        {userId
          ? `Файлы пользователя "${username || userId}"`
          : 'Мои файлы'}
      </h2>

      {!userId && (
        <form
          onSubmit={async e => {
            e.preventDefault()
            if (!file) return
            await dispatch(upload({ file, comment }))
            addToast('✅ Файл успешно загружен')
            setFile(null)
            setComment('')
          }}
        >
          <input type="file" onChange={e => setFile(e.target.files[0])} />
          <input
            placeholder="Комментарий"
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
          <button type="submit">Загрузить</button>
        </form>
      )}

      {loading ? (
        <p>Загрузка…</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Имя</th>
              <th>Размер</th>
              <th>Загружен</th>
              <th>Последнее скач.</th>
              <th>Комментарий</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {items.map(f => (
              <FileRow key={f.id} f={f} addToast={addToast} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
