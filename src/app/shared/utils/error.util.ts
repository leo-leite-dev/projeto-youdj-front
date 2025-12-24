export function extractErrorMessage(err: any): string {
    if (!err) return 'Erro inesperado. Tente novamente.';

    const status: number | undefined = err?.status ?? err?.statusCode;

    const body = err?.error ?? err;
    const detail =
        body?.detail ??
        body?.title ??
        body?.message ??
        (Array.isArray(body?.errors) ? body.errors.map((e: any) => e?.message).filter(Boolean).join('\n') : undefined) ??
        (typeof body === 'string' ? body : undefined);

    if (status === 401)
        return 'Sessão expirada. Faça login novamente.';

    if (status === 403) {
        if (typeof detail === 'string' && /perm[ií]ss[aã]o insuficiente/i.test(detail))
            return detail;

        return detail || 'Acesso negado. Permissão insuficiente.';
    }

    return detail || (typeof err.message === 'string' ? err.message : 'Erro inesperado. Tente novamente.');
}