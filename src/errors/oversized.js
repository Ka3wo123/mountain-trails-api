class OversizeFileError extends Error {
  constructor(message = 'Oversize file error', extra = {}) {
    super(message);
    this.name = 'OversizeFileError';
    this.status = 413;
    this.extra = extra;
  }
}

export default OversizeFileError;
