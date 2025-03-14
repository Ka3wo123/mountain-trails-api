class BadCredentialsError extends Error {
  constructor(message = 'Bad credentials error', extra = {}) {
    super(message);
    this.name = 'BadCredentialsError';
    this.status = 400;
    this.extra = extra;
  }
}

export default BadCredentialsError;
