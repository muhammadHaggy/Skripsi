import { HTTPResponse } from "../utils/response.js";
import { priorityOptimizationService } from "../services/optimization-service.js";

const priorityOptimizationController = async (request, response, next) => {
  try {
    const type = request.decodedToken.type;
    const role = request.decodedToken.role;
    if (role.is_allowed_shipment && type == "web") {
      const { shipments, failedDO, status } = await priorityOptimizationService(
        request
      );
      const responseData = {
        shipments: shipments,
        failed_delivery_orders: failedDO[0],
      };
      response
        .status(200)
        .json(HTTPResponse(true, status, "Success", responseData, null));
    } else {
      response
        .status(401)
        .json(HTTPResponse(false, 401, null, null, "Unauthorized Role"));
    }
  } catch (error) {
    next(error);
  }
};

export { priorityOptimizationController };
