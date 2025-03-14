class DuplicateError extends Error {
  constructor(message = 'Duplicate error', extra = {}) {
    super(message);
    this.name = 'DuplicateError';
    this.status = 409;
    this.extra = extra;
  }
}

export default DuplicateError;
