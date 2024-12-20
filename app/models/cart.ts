import { BaseModel, column, belongsTo,  } from '@adonisjs/lucid/orm'
import Product from './product.js'
import User from './user.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Cart extends BaseModel {
  @column({ isPrimary: true })
  public id!: number

  @column()
  public userId!: number

  @column()
  public productId!: number

  @column()
  public quantity!: number

  @belongsTo(() => User)
  public user!: BelongsTo<typeof User>

  @belongsTo(() => Product)
  public product!: BelongsTo<typeof Product>
}