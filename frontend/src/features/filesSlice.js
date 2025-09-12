import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../api'

// список файлов
export const fetchFiles = createAsyncThunk('files/fetch', (userId) => {
  const q = userId ? `?user_id=${userId}` : ''
  return api.json('GET', `/api/files${q}`)
})

// загрузка файла
export const upload = createAsyncThunk('files/upload', ({ file, comment }) => {
  const fd = new FormData()
  fd.append('file', file)
  if (comment) fd.append('comment', comment)
  return api.form('/api/files/upload', fd) 
})

// удаление
export const removeFile = createAsyncThunk('files/remove', (id) => 
  api.json('DELETE', `/api/files/${id}/delete`)
)

// обновление
export const updateFile = createAsyncThunk('files/update', ({ id, patch }) => 
  api.json('PATCH', `/api/files/${id}`, patch)
)

// публикация
export const publish = createAsyncThunk('files/publish', (id) => 
  api.json('POST', `/api/files/${id}/publish`)
)

const slice = createSlice({
  name: 'files',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: b => {
    b.addCase(fetchFiles.pending, s => { s.loading = true })
     .addCase(fetchFiles.fulfilled, (s, a) => { s.loading = false; s.items = a.payload.files })
     .addCase(fetchFiles.rejected, (s, a) => { s.loading = false; s.error = a.error.message })
     .addCase(upload.fulfilled, (s, a) => { s.items.unshift(a.payload.file) })
     .addCase(removeFile.fulfilled, (s, a) => { s.items = s.items.filter(f => f.id !== a.meta.arg) })
     .addCase(updateFile.fulfilled, (s, a) => {
        const idx = s.items.findIndex(f => f.id === a.payload.file.id)
        if (idx >= 0) s.items[idx] = { ...s.items[idx], ...a.payload.file }
     })
  }
})

export default slice.reducer
