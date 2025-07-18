export interface UserModel {
  readonly id: string
  readonly email: string
  readonly password: string
  readonly createdAt: Date
}

export const createUserModel = (data: {
  id: string
  email: string
  password: string
  createdAt: Date
}): UserModel => ({
  id: data.id,
  email: data.email,
  password: data.password,
  createdAt: data.createdAt
})

export const createUserModelFromDomain = (data: {
  id: string
  email: string
  password: string
}): Omit<UserModel, "createdAt"> => ({
  id: data.id,
  email: data.email,
  password: data.password
})
