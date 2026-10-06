const hasExtension = (specifier) => /\.[^/]+$/.test(specifier.split(/[?#]/, 1)[0])

export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context)
  } catch (error) {
    const relative = specifier.startsWith('./') || specifier.startsWith('../')
    if (!relative || hasExtension(specifier) || error?.code !== 'ERR_MODULE_NOT_FOUND') throw error

    for (const extension of ['.ts', '.tsx']) {
      try {
        return await nextResolve(specifier + extension, context)
      } catch (candidateError) {
        if (candidateError?.code !== 'ERR_MODULE_NOT_FOUND') throw candidateError
      }
    }
    throw error
  }
}
