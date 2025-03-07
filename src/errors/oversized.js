class OversizeFileError extends Error {
  constructor(message = 'Oversize file error') {
    super(message);
    this.name = 'OversizeFileError';
    this.status = 413;
  }
}

export default OversizeFileError;
