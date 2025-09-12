import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../api'

export const login = createAsyncThunk(
  'auth/login',
  (cred) => api.json('POST', '/api/auth/login', cred)
)

export const register = createAsyncThunk(
  'auth/register',
  (payload) => api.json('POST', '/api/auth/register', payload)
)

export const logout = createAsyncThunk(
  'auth/logout',
  () => api.json('POST', '/api/auth/logout')
)

export const fetchMe = createAsyncThunk(
  'auth/me',
  () => api.json('GET', '/api/auth/me')
)

const slice = createSlice({
  name: 'auth',
  initialState: { user: null, error: null, loading: false },
  reducers: {},
  extraReducers: (b) => {
    b
      // login
      .addCase(login.pending, (s) => { s.loading = true; s.error = null })
      .addCase(login.fulfilled, (s, a) => { s.loading = false; s.user = a.payload.user })
      .addCase(login.rejected, (s, a) => { s.loading = false; s.error = a.error.message })

      // register
      .addCase(register.fulfilled, (s, a) => { s.user = a.payload.user })

      // logout
      .addCase(logout.fulfilled, (s) => { s.user = null })

      // fetchMe
      .addCase(fetchMe.pending, (s) => { s.loading = true })
      .addCase(fetchMe.fulfilled, (s, a) => { s.loading = false; s.user = a.payload })
      .addCase(fetchMe.rejected, (s) => { s.loading = false; s.user = null })
  }
})

export default slice.reducer
