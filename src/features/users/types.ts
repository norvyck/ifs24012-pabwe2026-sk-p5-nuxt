export interface User {
  id: number
  name: string
  email: string
  photo?: string | null
  email_verified_at?: string | null
  created_at?: string
  updated_at?: string
}

export interface ProfileUpdate {
  name: string
  email: string
}

export interface PasswordUpdate {
  password: string
  new_password: string
  new_password_confirmation: string
}
