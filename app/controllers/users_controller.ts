import User from '#models/user'
import { createUserValidator, updateUserValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
  // Método para exibir o perfil do usuário logado
  async profile({ auth, view, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.redirect().toRoute('auth.create') // Redireciona para o login se não estiver autenticado
    }
    return view.render('pages/users/profile', { user })
  }

  // Método para editar o perfil do usuário logado
  async update({ auth, request, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.redirect().toRoute('auth.create') // Redireciona para o login se não estiver autenticado
    }
  
    // Valida os dados recebidos
    const payload = await request.validateUsing(updateUserValidator)
  
    user.merge(payload) // Atualiza os dados do usuário com o payload recebido
    await user.save()
  
    return response.redirect().toRoute('users.profile')
  }

  // Métodos já existentes
  index() {
    // TODO: Implementar
  }

  create({ view }: HttpContext) {
    return view.render('pages/users/create')
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createUserValidator)

    const user = new User()
    user.fullName = payload.full_name || null;
    user.merge(payload)

    await user.save()

    return response.redirect().toRoute('auth.create')
  }
}
