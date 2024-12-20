import { HttpContext } from '@adonisjs/core/http'
import Cart from '#models/cart'
import Product from '#models/product'

export default class CartController {
  // Exibir o carrinho
  public async index({ auth, view }: HttpContext) {
    const user = auth.user!

    // Carregar os itens do carrinho do usuário
    const cartItems = await Cart.query().where('userId', user.id).preload('product')

    // Calcular o preço total
    const totalPrice = cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity)
    }, 0)

    return view.render('pages/cart/index', { cartItems, totalPrice })
  }

  // Adicionar um produto ao carrinho
  public async store({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const { productId, quantity } = request.only(['productId', 'quantity'])

    const product = await Product.findOrFail(productId)
    const requestedQuantity = parseInt(quantity, 10)

    if (isNaN(requestedQuantity) || requestedQuantity <= 0) {
      return response.badRequest('A quantidade deve ser um número válido e maior que zero.')
    }

    if (requestedQuantity > product.stock) {
      return response.badRequest('A quantidade solicitada excede o estoque disponível.')
    }

    const cartItem = await Cart.query()
      .where('userId', user.id)
      .andWhere('productId', productId)
      .first()

    if (cartItem) {
      const newQuantity = cartItem.quantity + requestedQuantity
      if (newQuantity > product.stock) {
        return response.badRequest('A quantidade total no carrinho excede o estoque disponível.')
      }
      cartItem.quantity = newQuantity
      await cartItem.save()
    } else {
      await Cart.create({
        userId: user.id,
        productId,
        quantity: requestedQuantity,
      })
    }

    return response.redirect().toRoute('cart.index')
  }

  public async update({ params, request, response }: HttpContext) {
    try {
      const cartItem = await Cart.findOrFail(params.id);
      const quantity = parseInt(request.input('quantity'), 10);
  
      if (isNaN(quantity) || quantity < 0) {
        return response.badRequest('A quantidade deve ser um número válido.');
      }
  
      if (quantity === 0) {
        // Se a quantidade for 0, remove o item do carrinho
        await cartItem.delete();
      } else {
        // Atualiza a quantidade no carrinho
        cartItem.quantity = quantity;
        await cartItem.save();
      }
  
      return response.redirect().toRoute('cart.index');
    } catch (error) {
      console.error('Erro ao atualizar item no carrinho:', error);
      return response.status(500).send('Erro ao atualizar item no carrinho.');
    }
  }
  

  public async updateQuantity({ params, request, response }: HttpContext) {
    const cartItem = await Cart.findOrFail(params.id)
    const quantity = parseInt(request.input('quantity'), 10)
    const product = await cartItem.related('product').query().firstOrFail()
  
    if (isNaN(quantity) || quantity < 0 || quantity > product.stock) {
      return response.badRequest('Quantidade deve ser válida e não exceder o estoque disponível.')
    }
  
    if (quantity === 0) {
      await cartItem.delete()
    } else {
      cartItem.quantity = quantity
      await cartItem.save()
    }
  
    return response.redirect().toRoute('cart.index')
  }
  

  // Adicionar quantidade ao item no carrinho
  public async addToCart({ params, request, response }: HttpContext) {
    try {
      const cartItem = await Cart.findOrFail(params.id)
      const quantityToAdd = parseInt(request.input('quantity'), 10)
      const product = await cartItem.related('product').query().firstOrFail()

      if (isNaN(quantityToAdd) || quantityToAdd <= 0) {
        return response.badRequest('A quantidade deve ser um número maior que zero.')
      }

      const newQuantity = cartItem.quantity + quantityToAdd
      if (newQuantity > product.stock) {
        return response.badRequest('A quantidade total no carrinho excede o estoque disponível.')
      }

      cartItem.quantity = newQuantity
      await cartItem.save()

      return response.redirect().toRoute('cart.index')
    } catch (error) {
      console.error('Erro ao adicionar item ao carrinho:', error)
      return response.status(500).send('Erro ao adicionar item ao carrinho.')
    }
  }

  // Remover quantidade do item no carrinho
  // Remove todos os itens do carrinho do usuário atual
public async remove({ auth, response }: HttpContext) {
  try {
    const user = auth.user!;

    // Remove todos os itens do carrinho associados ao usuário
    await Cart.query().where('userId', user.id).delete();

    return response.redirect().toRoute('cart.index');
  } catch (error) {
    console.error('Erro ao remover todos os itens do carrinho:', error);
    return response.status(500).send('Erro ao remover todos os itens do carrinho.');
  }
}

  // Excluir um item do carrinho
  public async destroy({ params, response }: HttpContext) {
    try {
      const cartItem = await Cart.findOrFail(params.id)
      await cartItem.delete()
      return response.redirect().toRoute('cart.index')
    } catch (error) {
      console.error('Erro ao excluir item do carrinho:', error)
      return response.status(500).send('Erro ao excluir item do carrinho')
    }
  }
}
