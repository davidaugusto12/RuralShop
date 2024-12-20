import { BaseSeeder } from '@adonisjs/lucid/seeders';
import Category from '#models/category';

export default class CategorySeeder extends BaseSeeder {
  public async run() {
    const categories = [
      { name: 'Acessórios' },
      { name: 'Roupas' },
      { name: 'Livros' },
    ];

    const categoryNames = categories.map(category => category.name);

    await Category.query().whereNotIn('name', categoryNames).delete();

    for (const category of categories) {
      await Category.updateOrCreate({ name: category.name }, category);
    }
  }
}

