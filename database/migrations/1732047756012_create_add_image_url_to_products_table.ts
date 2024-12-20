import { BaseSchema } from '@adonisjs/lucid/schema'

export default class AddImageUrlToProducts extends BaseSchema {
  protected tableName = 'products'

  /*public async up() {
    try {
      this.schema.alterTable(this.tableName, (table) => {
        table.string('image_url')
      })
    } catch (error) {
      console.log(`Erro ao adicionar a coluna 'image_url':`, error.message)
    }
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('image_url')
    })
  }
*/}
