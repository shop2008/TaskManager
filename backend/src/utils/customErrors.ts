class CustomError extends Error {
    statusCode: number;
  
    constructor(message: string, statusCode: number) {
      super(message);
      this.statusCode = statusCode;
    }
  }
  
  export class NotFoundError extends CustomError {
    constructor(message: string) {
      super(message, 404);
    }
  }
  
  export class ValidationError extends CustomError {
    constructor(message: string) {
      super(message, 400);
    }
  }
  
  export class UnauthorizedError extends CustomError {
    constructor(message: string) {
      super(message, 401);
    }
  }