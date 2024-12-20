import { BaseSeeder } from '@adonisjs/lucid/seeders';
import Product from '#models/product';

export default class ProductSeeder extends BaseSeeder {
  public async run() {
    const products = [
      { name: 'RuralPatch', price: 15, description: 'Patch Bordado UFRRJ', categoryId: 1, image_url: '/images/Patch.png'  },
      { name: 'Ruralshirt', price: 50, description: 'Camisa de algodão', categoryId: 2, image_url: '/images/produto-2.png' },
      { name: 'Rural Web Book', price: 90, description: 'Livro sobre programação web', categoryId: 3, image_url: '/images/produto-3.png' },
    ];

    const productNames = products.map(product => product.name);

    await Product.query().whereNotIn('name', productNames).delete();

    for (const product of products) {
      await Product.updateOrCreate({ name: product.name }, product);
    }
  }
}




