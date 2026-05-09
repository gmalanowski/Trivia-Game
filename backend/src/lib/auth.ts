export interface RegisterDto {
  email: string,
  username: string,
  password: string
}

export interface LoginDto {
  identifier: string,
  password: string
}

export interface AuthResponse {
  message: string,
  token: string,
  user: {
    id: string,
    email: string,
    username: string
  }
}

export interface AuthError {
  error: string
}