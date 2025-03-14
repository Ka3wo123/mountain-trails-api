class UnsupportedFormatError extends Error {
  constructor(message = 'Unsupported file format error', extra = {}) {
    super(message);
    this.name = 'UnsupportedFormatError';
    this.status = 415;
    this.extra = extra;
  }
}

export default UnsupportedFormatError;
