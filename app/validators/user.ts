import vine from '@vinejs/vine'

/**
 * Validates the user's creation action
 */
export const createUserValidator = vine.compile(
  vine.object({
    email: vine.string().email().trim(),
    password: vine.string().minLength(3).confirmed(),
    full_name: vine.string().trim().optional(),
  })
)

/**
 * Validates the user's update action
 */
export const updateUserValidator = vine.compile(
  vine.object({
    email: vine.string().email().optional(), 
    password: vine.string().minLength(3).optional(), 
    full_name: vine.string().minLength(3).optional(),
  })
)

