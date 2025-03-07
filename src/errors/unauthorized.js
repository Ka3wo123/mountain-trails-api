class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized error') {
    super(message);
    this.name = 'UnauthorizedError';
    this.status = 401;
  }
}

export default UnauthorizedError;
