import { Request, Response, NextFunction } from 'express';

// Custom error classes
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

interface ErrorResponse {
  status: number;
  error: string;
  message: string;
  details?: any;
  timestamp: string;
}

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error details
  console.error({
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Determine error type and status code
  let status = 500;
  let message = 'Internal server error';

  if (err instanceof ValidationError) {
    status = 400;
    message = err.message;
  } else if (err instanceof AuthenticationError) {
    status = 401;
    message = err.message || 'Authentication failed';
  } else if (err instanceof AuthorizationError) {
    status = 403;
    message = err.message || 'Access denied';
  } else if (err instanceof NotFoundError) {
    status = 404;
    message = err.message || 'Resource not found';
  } else if (err.message) {
    message = err.message;
  }

  // Return consistent error response
  const errorResponse: ErrorResponse = {
    status,
    error: err.name,
    message,
    timestamp: new Date().toISOString()
  };

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.details = err.stack;
  }

  res.status(status).json(errorResponse);
};

export default errorHandler;
