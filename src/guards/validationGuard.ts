import { CoinDetailParamsSchema, CoinMarketParams, CoinsMarketParamsSchema, VsCurrencySchema, CoinDetailParams, SearchQuery, SearchQuerySchema } from "@/types/yup";
import { NextResponse } from "next/server";
import { ValidationError } from "yup";
import { GlobalDataParams } from "@/types/yup";

export type GuardResult<T> =
| {success: true, data: T}
| {success: false, response: NextResponse};

export async function validateMarketParams(searchParams: URLSearchParams): Promise<GuardResult<CoinMarketParams>> {
  try {
    const rawParams = Object.fromEntries(searchParams);

    const validatedData = await CoinsMarketParamsSchema.validate(rawParams, {
      abortEarly: false,
      strict: false,
    });

    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
          success: false,
          response: NextResponse.json(
            { error: 'Invalid parameters', details: error.errors },
            { status: 400 }
          ),
        };
      }

      return {
        success: false,
        response: NextResponse.json(
          { error: 'Validation error' },
          { status: 400 }
        ),
      };
    }
}

export async function validateGlobalParams(searchParams: URLSearchParams): Promise<GuardResult<GlobalDataParams>> {
  try {
    const rawParams = Object.fromEntries(searchParams);

    const validatedData = await VsCurrencySchema.validate(rawParams, {
      abortEarly: false,
      strict: false,
    });

    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
          success: false,
          response: NextResponse.json(
            { error: 'Invalid parameters', details: error.errors },
            { status: 400 }
          ),
        };
      }

      return {
        success: false,
        response: NextResponse.json(
          { error: 'Validation error' },
          { status: 400 }
        ),
      };
    }
}

export async function validateDetailParams(searchParams: URLSearchParams): Promise<GuardResult<CoinDetailParams>> {
  try {
    const rawParams = Object.fromEntries(searchParams);

    const validatedData = await CoinDetailParamsSchema.validate(rawParams, {
      abortEarly: false,
      strict: false,
    });

    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
          success: false,
          response: NextResponse.json(
            { error: 'Invalid parameters', details: error.errors },
            { status: 404 }
          ),
        };
      }

      return {
        success: false,
        response: NextResponse.json(
          { error: 'Validation error' },
          { status: 400 }
        ),
      };
    }
}

export function isCoinMarketParams(obj: unknown): obj is CoinMarketParams {
  if (typeof obj !== 'object' || obj === null) return false;
  const params = obj as Record<string, unknown>;

  return (
    typeof params.vs_currency === 'string' &&
    params.vs_currency.length > 0
  )
};

export async function validateSearchParams(searchParams: URLSearchParams): Promise<GuardResult<SearchQuery>> {
  try {
    const rawParams = Object.fromEntries(searchParams);

    const validatedData = await SearchQuerySchema.validate(rawParams, {
      abortEarly: false,
      strict: false,
    });

    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
          success: false,
          response: NextResponse.json(
            { error: 'Invalid parameters', details: error.errors },
            { status: 400 }
          ),
        };
      }

      return {
        success: false,
        response: NextResponse.json(
          { error: 'Validation error' },
          { status: 400 }
        ),
      };
    }
}
