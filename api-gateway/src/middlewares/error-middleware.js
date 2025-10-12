import { ResponseError } from "../utils/response.js";
import { HTTPResponse } from "../utils/response.js";

const errorMiddleware = async (err, req, res, next) => {
  if (!err) {
    next();
    return;
  }
  if (err instanceof ResponseError) {
    res
      .status(err.status)
      .json(HTTPResponse(false, err.status, "Failed", null, err.message))
      .end();
  } else {
    res
      .status(err.status || 500)
      .json(
        HTTPResponse(
          false,
          err.status || 500,
          "Internal Server Error",
          null,
          err.message
        )
      )
      .end();
  }
};

export { errorMiddleware };
