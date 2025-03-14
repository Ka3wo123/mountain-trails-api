class NotFoundError extends Error {
  constructor(message = 'Not found error', extra = {}) {
    super(message);
    this.name = 'NotFoundError';
    this.status = 404;
    this.extra = extra;
  }
}

export default NotFoundError;
