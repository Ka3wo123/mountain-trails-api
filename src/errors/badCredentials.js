class BadCredentialsError extends Error {
  constructor(message = 'Bad credentials error') {
    super(message);
    this.name = 'BadCredentialsError';
    this.status = 400;
  }
}

export default BadCredentialsError;
