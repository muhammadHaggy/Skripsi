import { getAllDCService } from "../services/dc-service.js";
import { HTTPResponse } from "../utils/response.js";
const getAllDCController = async (request, response, next) => {
  try {
    if (request.decodedToken.type == "web") {
      const result = await getAllDCService();
      response
        .status(200)
        .json(HTTPResponse(true, 200, "Success", result, null));
    } else {
      response
        .status(401)
        .json(HTTPResponse(false, 401, null, null, "Unauthorized Device Type"));
    }
  } catch (error) {
    next(error);
  }
};

export { getAllDCController };
