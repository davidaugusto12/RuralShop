import { HttpContext } from "@adonisjs/core/http";
import Product from "#models/product";
import Category from "#models/category";

export default class ProductsController {
  // Listagem de produtos com organização por categorias
  public async index({ view, request, auth }: HttpContext) {
    const page = request.input('page', 1);
    const limit = 10;

    const payload = request.only(['name']);

    const query = Product.query().preload('category');

    if (payload.name && payload.name.length > 0) {
      query.where('name', 'like', `%${payload.name}%`);
    }

    const products = await query.paginate(page, limit);

    // Organizar produtos por categoria
    const productsByCategory = products.all().reduce((acc, product) => {
      const categoryName = product.category.name;
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(product);
      return acc;
    }, {} as Record<string, Product[]>);

    // Determina se o usuário é admin
    const isAdmin = auth.user?.isAdmin || false;

    return view.render('pages/products/index', { productsByCategory, isAdmin });
  }

  // Página de visualização do produto (inclui estoque)
  public async show({ view, params, response, auth }: HttpContext) {
    try {
      const product = await Product.findOrFail(params.id);
      await product.load('category');

      // Determina se o usuário é admin para exibir o formulário de estoque
      const isAdmin = auth.user?.isAdmin || false;

      return view.render('pages/products/show', { product, isAdmin });
    } catch (error) {
      return response.status(404).send("Produto não encontrado.");
    }
  }

  public async updateStock({ params, request, response }: HttpContext) {
    const product = await Product.findOrFail(params.id)
    const stock = parseInt(request.input('stock'), 10)
  
    if (isNaN(stock) || stock < 0) {
      return response.badRequest('Estoque deve ser um número válido e não negativo.')
    }
  
    product.stock = stock
    await product.save()
  
    return response.redirect().toRoute('products.show', { id: product.id })
  }
  

  // Adicionar estoque
  public async addStock({ params, request, response }: HttpContext) {
    const product = await Product.findOrFail(params.id);
    const { quantity } = request.only(['quantity']);
    const amountToAdd = parseInt(quantity, 10);

    if (isNaN(amountToAdd) || amountToAdd <= 0) {
      return response.badRequest('A quantidade deve ser um número válido e maior que zero.');
    }

    product.stock += amountToAdd;
    await product.save();

    return response.redirect().toRoute('products.show', { id: product.id });
  }

  // Remover estoque
  public async removeStock({ params, request, response }: HttpContext) {
    const product = await Product.findOrFail(params.id);
    const { quantity } = request.only(['quantity']);
    const amountToRemove = parseInt(quantity, 10);

    if (isNaN(amountToRemove) || amountToRemove <= 0) {
      return response.badRequest('A quantidade deve ser um número válido e maior que zero.');
    }

    if (amountToRemove > product.stock) {
      return response.badRequest('A quantidade a remover excede o estoque disponível.');
    }

    product.stock -= amountToRemove;
    await product.save();

    return response.redirect().toRoute('products.show', { id: product.id });
  }

  // Página de criação de produto
  public async create({ view }: HttpContext) {
    const categories = await Category.all();
    return view.render('pages/products/create', { categories });
  }

  // Adicionar um novo produto
  public async store({ request, response }: HttpContext) {
    try {
      const payload = request.only(['name', 'price', 'description', 'categoryId', 'imageUrl', 'stock']);
      const product = await Product.create(payload);

      return response.redirect().toRoute('products.show', { id: product.id });
    } catch (error) {
      console.error('Erro ao criar o produto:', error);
      return response.status(400).send("Erro ao criar o produto.");
    }
  }

  // Página de edição de produto
  public async edit({ view, params }: HttpContext) {
    const product = await Product.findOrFail(params.id);
    const categories = await Category.all();

    return view.render('pages/products/edit', { product, categories });
  }

  // Atualizar informações do produto
  public async update({ params, request, response }: HttpContext) {
    const product = await Product.findOrFail(params.id);
    const payload = request.only(['name', 'price', 'description', 'categoryId', 'stock']);
    product.merge(payload);

    await product.save();

    return response.redirect().toRoute('products.show', { id: product.id });
  }

  // Excluir produto
  public async destroy({ params, response }: HttpContext) {
    try {
      const product = await Product.findOrFail(params.id);
      await product.delete();
      return response.redirect().toRoute('products.index');
    } catch (error) {
      return response.status(404).send('Produto não encontrado ou já excluído.');
    }
  }
}