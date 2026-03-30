import { getErrorMessage, createErrorResponse } from '@/utils/errorUtils';
import { NextResponse } from 'next/server';

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((body, options) => ({ body, options })),
  },
}));

describe('errorUtils - getErrorMessage', () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    (process.env as any).NODE_ENV = originalEnv;
  });

  describe('Development Environment', () => {
    beforeEach(() => {
      (process.env as any).NODE_ENV = 'development';
    });

    it('should return Error.message for Error instances', () => {
      const error = new Error('Test error message');
      expect(getErrorMessage(error)).toBe('Test error message');
    });

    it('should return message property from object', () => {
      const error = { message: 'Object error message' };
      expect(getErrorMessage(error)).toBe('Object error message');
    });

    it('should return string error directly', () => {
      expect(getErrorMessage('String error')).toBe('String error');
    });
  });

  describe('Production Environment', () => {
    beforeEach(() => {
      (process.env as any).NODE_ENV = 'production';
    });

    it('should return generic message when isClientSafe is false', () => {
      const error = new Error('Sensitive error info');
      expect(getErrorMessage(error, false)).toBe(
        'An internal server error occurred. Please try again later.',
      );
    });

    it('should return actual message when isClientSafe is true', () => {
      const error = new Error('Safe error message');
      expect(getErrorMessage(error, true)).toBe('Safe error message');
    });
  });
});

describe('errorUtils - createErrorResponse', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error during tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create 500 response with generic error', () => {
    const error = new Error('Database connection failed');
    createErrorResponse(error, 500);

    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Internal Server Error',
      }),
      { status: 500 },
    );
  });

  it('should create 404 response with "Not Found" error', () => {
    const error = new Error('Resource not found');
    createErrorResponse(error, 404);

    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Not Found',
      }),
      { status: 404 },
    );
  });

  it('should create 400 response with "Bad Request" error', () => {
    const error = new Error('Invalid input');
    createErrorResponse(error, 400);

    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Bad Request',
      }),
      { status: 400 },
    );
  });

  it('should log error to console', () => {
    const error = new Error('Test error');
    createErrorResponse(error, 500);

    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('[API ERROR 500]'), error);
  });

  it('should use default status 500 if not provided', () => {
    const error = new Error('Test error');
    createErrorResponse(error);

    expect(NextResponse.json).toHaveBeenCalledWith(expect.anything(), { status: 500 });
  });
});
