import { BaseSchema } from '@adonisjs/lucid/schema'

export default class AddStockToProducts extends BaseSchema {
  protected tableName = 'products'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('stock').unsigned().defaultTo(0) // Campo para o estoque
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('stock') // Remove o campo em caso de rollback
    })
  }
}