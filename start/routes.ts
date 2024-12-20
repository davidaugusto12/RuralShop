import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
import User from '#models/user'

const CategoryController = () => import('#controllers/categories_controller')
const UsersController = () => import('#controllers/users_controller')
const ProductsController = () => import('#controllers/products_controller')
const AuthController = () => import('#controllers/auth_controller')
const CartController = () => import('#controllers/cart_controller')

// Rota para redirecionar o usuário para o Google
router.get('/auth/google', async ({ ally }) => {
  return ally.use('google').redirect()
}).as('auth.google.redirect')

// Rota para callback do Google
router.get('/auth/google/callback', async ({ ally, auth, response, session }) => {
  try {
    const google = ally.use('google')

    if (google.accessDenied()) {
      session.flash('error', 'Acesso negado.')
      return response.redirect().toRoute('auth.create')
    }

    if (google.stateMisMatch()) {
      session.flash('error', 'Falha ao validar a autenticação.')
      return response.redirect().toRoute('auth.create')
    }

    if (google.hasError()) {
      const error = google.getError()
      if (error) {
        session.flash('error', error) // Apenas adiciona o erro se ele existir
      }
      return response.redirect().toRoute('auth.create')
    }

    const googleUser = await google.user()

    // Procurar um usuário pelo ID do Google
    let user = await User.findBy('google_id', googleUser.id)

    // Se não existir, criar o usuário
    if (!user) {
      user = await User.create({
        googleId: googleUser.id,
        email: googleUser.email,
        fullName: googleUser.name,
        password: '', 
      })
    }

    // Logar o usuário
    await auth.use('web').login(user)

    return response.redirect().toRoute('home.show')
  } catch (error) {
    console.error('Erro ao autenticar com o Google:', error)
    session.flash('error', 'Ocorreu um erro inesperado durante a autenticação.')
    return response.redirect().toRoute('auth.create')
  }
}).as('auth.google.callback')

router.on('/').render('pages/home/show').as('home.show')

router.get('/login', [AuthController, 'create']).as('auth.create')
router.post('/login', [AuthController, 'store']).as('auth.store')
router.get('/logout', [AuthController, 'destroy']).use(middleware.auth()).as('auth.destroy')

router.get('/user', [UsersController, 'create']).as('users.create')
router.post('/user', [UsersController, 'store']).as('users.store')

router
  .group(() => {
    router.get('/products', [ProductsController, 'index']).as('products.index')
    router.get('/products/new', [ProductsController, 'create']).as('products.create')
    router.get('/products/:id', [ProductsController, 'show']).as('products.show')
    router.post('/products', [ProductsController, 'store']).as('products.store')
    router.delete('/products/:id', [ProductsController, 'destroy']).as('products.destroy')
    router.post('/products/:id/update-stock', [ProductsController, 'updateStock']).as('products.updateStock');
    router.get('/profile', [UsersController, 'profile']).as('users.profile');
    router.post('/profile', [UsersController, 'update']).as('users.update');
    router.get('/cart', [CartController, 'index']).as('cart.index')
    router.post('/cart', [CartController, 'store']).as('cart.store')
    router.delete('/cart/:id', [CartController, 'destroy']).as('cart.destroy')
    router.post('/cart/:id/add', [CartController, 'addToCart']).as('cart.add')
    router.post('/cart/remove-all', [CartController, 'remove']).as('cart.removeAll');
    router.post('/cart/:id/update', [CartController, 'update']).as('cart.update');
     })
  .use(middleware.auth())

router.group(() => {
  router.get('/products/:id/edit', [ProductsController, 'edit']).as('products.edit')
  router.put('/products/:id', [ProductsController, 'update']).as('products.update')
}).middleware([middleware.auth(), middleware.isAdmin()])

router.get('/categories/:id', [CategoryController, 'show']).as('categories.show')