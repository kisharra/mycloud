import { configureStore } from '@reduxjs/toolkit'
import auth from './features/authSlice'
import files from './features/filesSlice'
import users from './features/usersSlice'

export default configureStore({ reducer: { auth, files, users } })