import { BaseSchema } from '@adonisjs/lucid/schema'

export default class AddIsAdminToUsers extends BaseSchema {
  protected tableName = 'users'

  /*public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('is_admin').defaultTo(false) // Novo campo
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('is_admin')
    })
  }
*/}