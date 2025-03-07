class NotFoundError extends Error {
  constructor(message = 'Not found error') {
    super(message);
    this.name = 'NotFoundError';
    this.status = 404;
  }
}

export default NotFoundError;
