class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized error', extra = {}) {
    super(message);
    this.name = 'UnauthorizedError';
    this.status = 401;
    this.extra = extra;
  }
}

export default UnauthorizedError;
