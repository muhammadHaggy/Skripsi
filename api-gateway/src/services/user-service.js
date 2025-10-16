import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import {
  createUser,
  updateUser,
  getUserDetails,
  getAllUsers,
  countUser,
} from "../repositories/user-db.js";
import {
  registerUserValidator,
  updateUserValidator,
  loginUserValidator,
  refreshTokenValidator,
} from "../validators/user-validator.js";
import { ResponseError } from "../utils/response.js";
import { validate } from "../validators/validator.js";
import { getDCbyID } from "../repositories/dc-repository.js";
import {
  countDeliveryOrder,
  countUnprocessedDO,
} from "../repositories/delivery-order-repository.js";
import { countDashboardShipment } from "../repositories/shipment-repository.js";
import {
  countTruck,
  countAvailableTruck,
} from "../repositories/truck-repository.js";

const jwtSecretKey = process.env.SECRET_KEY;

const registerUserService = async (request) => {
  const userData = validate(registerUserValidator, request.body);
  const existingUsers = await countUser(
    userData.username,
    userData.email,
    null,
    null
  );

  if (existingUsers > 0) {
    throw new ResponseError(400, "User already exists");
  }
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const userId = uuidv4();

  const user = await createUser({
    ...userData,
    password: hashedPassword,
    id: userId,
  });
  const { password, ...result } = user;

  return result;
};

const updateUserService = async (request) => {
  const user = validate(updateUserValidator, request.body);
  const totalUser = await countUser(null, null, null, user.id);

  if (totalUser == 0) {
    throw new ResponseError(400, "User is not found!");
  }

  return await updateUser(user.id, {
    username: user.username,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    phone_num: user.phone_num,
    role_id: user.role_id,
    is_active: user.is_active,
  });
};

const loginUserWebService = async (request) => {
  const loginRequest = validate(loginUserValidator, request.body);

  const totalUser = await countUser(loginRequest.username, null, null, null);

  if (totalUser == 0) {
    throw new ResponseError(401, "Username or password is wrong!");
  }

  const { password, web_token, ...user } = await getUserDetails(
    null,
    loginRequest.username,
    null
  );
  const isPasswordValid = await bcrypt.compare(loginRequest.password, password);

  if (!isPasswordValid) {
    throw new ResponseError(401, "Username or password is wrong!");
  }
  const userType = { ...user, type: "web" };

  const newToken = jwt.sign(userType, jwtSecretKey, {
    expiresIn: "5h",
  });

  await updateUser(user.id, { web_token: newToken });

  return newToken;
};
const loginUserMobileService = async (request) => {
  const loginRequest = validate(loginUserValidator, request.body);

  const totalUser = await countUser(loginRequest.username, null, null, null);

  if (totalUser == 0) {
    throw new ResponseError(401, "Username or password is wrong!");
  }

  const { password, web_token, ...user } = await getUserDetails(
    null,
    loginRequest.username,
    null
  );
  const isPasswordValid = await bcrypt.compare(loginRequest.password, password);

  if (!isPasswordValid) {
    throw new ResponseError(401, "Username or password is wrong!");
  }
  const userType = { ...user, type: "mobile" };

  const newToken = jwt.sign(userType, jwtSecretKey, {
    expiresIn: "5h",
  });

  const dc = await getDCbyID(user.role.dc_id);

  await updateUser(user.id, { mobile_token: newToken });
  return {
    token: newToken,
    username: user.username,
    role: user.role ? user.role.name : null,
    dc: dc ? dc.name : null,
  };
};

const logoutUserService = async (request) => {
  const userId = request.decodedToken?.id;
  if (!userId) {
    throw new ResponseError(401, "Unauthorized");
  }
  await updateUser(userId, { web_token: null, mobile_token: null });
};

const refreshTokenService = async (request) => {
  const oldToken = validate(refreshTokenValidator, request.body.old_token);
  const totalUser = await countUser(null, null, oldToken, null);

  if (totalUser === 0) {
    throw new ResponseError(404, "Old token is invalid");
  }

  const found = await getUserDetails(null, null, oldToken);
  const { password, web_token, mobile_token, ...userCore } = found;

  const tokenType = oldToken === web_token ? "web" : oldToken === mobile_token ? "mobile" : "web";
  const payload = { ...userCore, type: tokenType };

  const newToken = jwt.sign(payload, jwtSecretKey, { expiresIn: "5h" });

  if (tokenType === "mobile") {
    await updateUser(userCore.id, { mobile_token: newToken });
  } else {
    await updateUser(userCore.id, { web_token: newToken });
  }
  return newToken;
};

const activateUserService = async (request) => {
  const users_id = request.decodedToken.role;
  let users = [];
  for (let index = 0; index < users_id.length; index++) {
    const user_id = users_id[index].id;
    const user = await updateUser(user_id, {
      is_active: true,
    });
    users.push(user);
  }
  return users;
};

const deactivateUserService = async (request) => {
  const users_id = request.body;

  let users = [];
  for (let index = 0; index < users_id.length; index++) {
    const user_id = users_id[index].id;
    const user = await updateUser(user_id, {
      is_active: false,
    });
    users.push(user);
  }
  return users;
};

const getAllUsersService = async () => {
  return await getAllUsers();
};

async function dashboardService(dc_id) {
  const totalOrders = await countDeliveryOrder(dc_id);
  const totalUnprocessedOrders = await countUnprocessedDO(dc_id);
  const totalShipments = await countDashboardShipment(dc_id);
  const totalTrucks = await countTruck(dc_id);
  const totalAvailableTrucks = await countAvailableTruck(dc_id);

  return {
    "Total Order": totalOrders,
    "Total Truk": totalTrucks,
    "Total Pengiriman": totalShipments,
    "Total Order Belum Di Proses": totalUnprocessedOrders,
    "Total Truk Tersedia": totalAvailableTrucks,
  };
}

async function dashboardServiceAdmin() {
  const totalOrders = await countDeliveryOrder(null);
  const totalUnprocessedOrders = await countUnprocessedDO(null);
  const totalShipments = await countDashboardShipment(null);
  const totalTrucks = await countTruck(null);
  const totalAvailableTrucks = await countAvailableTruck(null);

  return {
    "Total Order": totalOrders,
    "Total Truk": totalTrucks,
    "Total Pengiriman": totalShipments,
    "Total Order Belum Di Proses": totalUnprocessedOrders,
    "Total Truk Tersedia": totalAvailableTrucks,
  };
}

export default {
  registerUserService,
  updateUserService,
  loginUserWebService,
  loginUserMobileService,
  refreshTokenService,
  activateUserService,
  deactivateUserService,
  getAllUsersService,
  logoutUserService,
  dashboardService,
  dashboardServiceAdmin,
};
