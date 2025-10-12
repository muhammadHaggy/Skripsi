function HTTPResponse(success, code, message, data, error) {
  return {
    success,
    code,
    message,
    data,
    error,
  };
}

class ResponseError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export { HTTPResponse, ResponseError };
