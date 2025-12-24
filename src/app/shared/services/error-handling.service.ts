import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MonoTypeOperatorFunction, Observable, catchError, throwError } from 'rxjs';

interface ProblemDetails {
    type?: string;
    title?: string;
    status?: number;
    detail?: string;
    instance?: string;
}

export interface NormalizedError {
    message: string;
    status: number;
    fieldErrors?: Record<string, string>;
}

interface ValidationProblemDetails extends ProblemDetails {
    errors?: Record<string, string[]>;
}

function isHttpError(e: unknown): e is HttpErrorResponse {
    return e instanceof HttpErrorResponse;
}

function isValidationProblem(e: any): e is ValidationProblemDetails {
    return e && typeof e === 'object' && 'errors' in e && typeof e.errors === 'object';
}

function isProblem(e: any): e is ProblemDetails {
    return e && typeof e === 'object' && ('title' in e || 'detail' in e || 'status' in e);
}

export function isNormalizedError(err: unknown): err is NormalizedError {
    if (!err)
        return false;

    if (err instanceof HttpErrorResponse)
        return false;

    const any = err as any;
    if ('error' in any)
        return false;

    return typeof any.message === 'string' && typeof any.status === 'number';
}


function tryParseJson<T = any>(raw: unknown): T | undefined {
    if (typeof raw !== 'string')
        return undefined;

    const s = raw.trim();
    if (!s.startsWith('{') && !s.startsWith('['))
        return undefined;

    try {
        return JSON.parse(s) as T;
    }
    catch {
        return undefined;

    }
}

@Injectable({ providedIn: 'root' })
export class ErrorHandlingService {
    parse(error: unknown): NormalizedError {
        if (isNormalizedError(error))
            return error;

        const err = isHttpError(error) ? error : new HttpErrorResponse({ error });

        if (err.status === 0)
            return { status: 0, message: 'Erro de conexão com o servidor.' };

        let raw: any = err.error;
        const parsedJson = tryParseJson(raw);
        if (parsedJson !== undefined)
            raw = parsedJson;

        const known = new Set(['type', 'title', 'status', 'detail', 'instance', 'errors']);
        const fieldErrors: Record<string, string> = {};

        const bag = raw?.errors ?? raw;
        if (bag && typeof bag === 'object') {
            for (const k of Object.keys(bag)) {
                if (known.has(k)) continue;
                const v = bag[k];
                if (typeof v === 'string' && v.trim()) fieldErrors[k] = v.trim();
                else if (Array.isArray(v) && v.length && typeof v[0] === 'string') fieldErrors[k] = v[0].trim();
            }
        }

        if (err.status === 400 && (isValidationProblem(raw) || Object.keys(fieldErrors).length)) {
            const flat = raw?.errors
                ? Object.entries(raw.errors)
                    .flatMap(([f, msgs]) => {
                        if (Array.isArray(msgs)) 
                            return msgs.map((m: string) => `${f}: ${m}`);
                        
                        return [];
                    })
                    .join(' • ')
                : '';

            const message = flat || raw?.detail || 'Erro de validação.';
            return { status: 400, message, ...(Object.keys(fieldErrors).length ? { fieldErrors } : {}) };
        }

        if (raw && typeof raw === 'object') {
            const title = typeof raw.title === 'string' ? raw.title.trim() : undefined;
            const detail = typeof raw.detail === 'string' ? raw.detail.trim() : undefined;
            if (title || detail) {
                const message = [title, detail].filter(Boolean).join(' — ') || err.message || 'Erro ao processar a requisição.';
                return { status: err.status, message, ...(Object.keys(fieldErrors).length ? { fieldErrors } : {}) };
            }
        }

        if (typeof raw === 'string' && raw.trim())
            return { status: err.status, message: raw.trim(), ...(Object.keys(fieldErrors).length ? { fieldErrors } : {}) };


        const byStatus: Record<number, string> = {
            401: 'Sessão inválida ou expirada.',
            403: 'Você não tem permissão para acessar este recurso.',
            404: 'Recurso não encontrado.',
            409: 'Conflito de negócio.',
            500: 'Erro interno no servidor.',
            502: 'Erro de gateway. O servidor está indisponível.',
            503: 'Serviço temporariamente indisponível.'
        };
        const fallback = byStatus[err.status] ?? (err.message || 'Algo deu errado. Por favor, tente novamente.');
        return { status: err.status, message: fallback, ...(Object.keys(fieldErrors).length ? { fieldErrors } : {}) };
    }

    handleWithThrow = (error: unknown) => {
        const { message, status } = this.parse(error);
        console.error('[HTTP]', status, message);
        return throwError(() => ({ message, status }));
    };

    handleWithLog(error: unknown, context?: string): string {
        const { message, status } = this.parse(error);
        console.error(context ? `[${context}]` : '[HTTP]', status, message);
        return message;
    }

    rxThrow<T>(context?: string): MonoTypeOperatorFunction<T> {
        return (source: Observable<T>) =>
            source.pipe(
                catchError(err => {
                    const norm = this.parse(err);
                    if (context)
                        console.error(`[${context}]`, norm.status, norm.message);

                    return throwError(() => norm);
                })
            );
    }
}