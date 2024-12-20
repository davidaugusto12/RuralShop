import type { HttpContext } from '@adonisjs/core/http'

export default class IsAdminMiddleware {
  public async handle(ctx: HttpContext, next: () => Promise<void>) {
    const user = ctx.auth.user

    if (!user || !user.isAdmin) {
      return ctx.response.unauthorized({ message: 'Acesso negado: apenas administradores podem acessar esta página.' })
    }

    await next()
  }
}