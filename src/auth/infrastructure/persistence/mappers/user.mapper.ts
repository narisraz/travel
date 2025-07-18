import type { User } from "@/auth/domain/entities/account.entity.js"
import { createEmail } from "@/auth/domain/value-objects/Email.js"
import { Effect } from "effect"
import type { UserModel } from "../models/user.model.js"

export const mapUserModelToDomain = (userModel: UserModel): User => ({
  id: userModel.id,
  email: createEmail(userModel.email).pipe(Effect.runSync),
  password: userModel.password
})

export const mapDomainToUserModel = (user: User): Omit<UserModel, "createdAt"> => ({
  id: user.id,
  email: String(user.email),
  password: user.password
})
