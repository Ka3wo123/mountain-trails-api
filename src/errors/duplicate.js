class DuplicateError extends Error {
  constructor(message = 'Duplicate error') {
    super(message);
    this.name = 'DuplicateError';
    this.status = 409;
  }
}

export default DuplicateError;
