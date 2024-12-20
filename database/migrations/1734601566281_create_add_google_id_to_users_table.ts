import { BaseSchema } from '@adonisjs/lucid/schema'

export default class AddGoogleIdToUsers extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('google_id').unique().nullable()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('google_id')
    })
  }
}