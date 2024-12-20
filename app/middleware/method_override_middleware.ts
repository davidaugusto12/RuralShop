import { HttpContext } from '@adonisjs/core/http'

export default class MethodOverrideMiddleware {
  async handle(ctx: HttpContext, next: () => Promise<void>) {
    const methodOverride = ctx.request.input('_method')?.toUpperCase()
    const allowedMethods = ['PUT', 'PATCH', 'DELETE']

    if (methodOverride && allowedMethods.includes(methodOverride)) {
      ctx.request.request.method = methodOverride
    }

    await next()
  }
}



