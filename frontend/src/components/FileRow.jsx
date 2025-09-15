import React, { useState } from 'react'
import { useAppDispatch } from '../hooks'
import { removeFile, updateFile, publish } from '../features/filesSlice'

export default function FileRow({ f, addToast }) {
  const [edit, setEdit] = useState(false)
  const [name, setName] = useState(f.original_name)
  const [comment, setComment] = useState(f.comment || '')
  const dispatch = useAppDispatch()

  const handleDownload = async () => {
    const res = await fetch(`/api/files/${f.id}/download`, { credentials: 'include' })
    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = f.original_name
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <tr>
      <td>{edit ? <input value={name} onChange={e => setName(e.target.value)} /> : f.original_name}</td>
      <td>{(f.size / 1024).toFixed(1)} KB</td>
      <td>{new Date(f.uploaded_at).toLocaleString()}</td>
      <td>{f.last_downloaded_at ? new Date(f.last_downloaded_at).toLocaleString() : '—'}</td>
      <td>{edit ? <input value={comment} onChange={e => setComment(e.target.value)} /> : (f.comment || '—')}</td>
      <td>
        {!edit && (
          <>
            <button onClick={handleDownload}>Скачать</button>
            <button className="btn-danger" onClick={() => dispatch(removeFile(f.id))}>Удалить</button>
            <button onClick={() => setEdit(true)}>Переименовать</button>
            <button onClick={async () => {
              const { public_url } = await dispatch(publish(f.id)).unwrap()
              const link = window.location.origin + public_url

              if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(link)
                addToast('✅ Публичная ссылка скопирована!')
              } else {
                prompt('Скопируйте ссылку:', link)
              }
            }}>
              Ссылка
            </button>
          </>
        )}
        {edit && (
          <>
            <button onClick={async () => { 
              await dispatch(updateFile({ id: f.id, patch: { original_name: name, comment } }))
              setEdit(false)
            }}>Сохранить</button>
            <button onClick={() => { setEdit(false); setName(f.original_name); setComment(f.comment || '') }}>Отмена</button>
          </>
        )}
      </td>
    </tr>
  )
}
