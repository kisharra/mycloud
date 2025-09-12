import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../api'

export const fetchUsers = createAsyncThunk('users/fetch', () => api.json('GET', '/api/users'))
export const deleteUser = createAsyncThunk('users/delete', (id) => api.json('DELETE', `/api/users/${id}`))
export const toggleAdmin = createAsyncThunk('users/toggleAdmin', (id) => api.json('POST', `/api/users/${id}/toggle-admin`))

const slice = createSlice({
  name: 'users',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: b => {
    b.addCase(fetchUsers.pending, s => { s.loading = true })
     .addCase(fetchUsers.fulfilled, (s, a) => { s.loading = false; s.items = a.payload.users })
     .addCase(deleteUser.fulfilled, (s, a) => { s.items = s.items.filter(u => u.id !== a.meta.arg) })
     .addCase(toggleAdmin.fulfilled, (s, a) => {
        const u = a.payload.user; const i = s.items.findIndex(x => x.id === u.id)
        if (i >= 0) s.items[i] = { ...s.items[i], ...u }
     })
  }
})
export default slice.reducer