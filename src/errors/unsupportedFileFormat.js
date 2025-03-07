class UnsupportedFormatError extends Error {
  constructor(message = 'Unsupported file format error') {
    super(message);
    this.name = 'UnsupportedFormatError';
    this.status = 415;
  }
}

export default UnsupportedFormatError;
