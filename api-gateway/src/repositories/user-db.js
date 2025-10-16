import { prisma } from "../config/database.js";

async function createUser(data) {
  return await prisma.user.create({
    data: data,
  });
}

async function updateUser(user_id, data) {
  return await prisma.user.update({
    where: {
      id: user_id,
    },
    data: data,
  });
}

async function getUserDetails(user_id, username, token) {
  let user_id_query = {};
  if (user_id != null) {
    user_id_query = {
      id: user_id,
    };
  }

  let username_query = {};
  if (username != null) {
    username_query = {
      username: {
        equals: username,
        mode: "insensitive",
      },
    };
  }

  let token_query = {};
  if (token != null) {
    token_query = {
      OR: [
        { web_token: token },
        { mobile_token: token },
      ],
    };
  }

  return await prisma.user.findFirst({
    where: {
      AND: [user_id_query, username_query, token_query],
    },
    select: {
      id: true,
      username: true,
      password: true,
      first_name: true,
      last_name: true,
      email: true,
      phone_num: true,
      web_token: true,
      mobile_token: true,
      role_id: true,
      is_active: true,
      role: {
        select: {
          id: true,
          name: true,
          is_allowed_shipment: true,
          is_allowed_do: true,
          is_allowed_location: true,
          is_allowed_truck: true,
          is_allowed_user: true,
          dc_id: true,
        },
      },
    },
  });
}

async function getAllUsers() {
  return await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      password: true,
      first_name: true,
      last_name: true,
      email: true,
      phone_num: true,
      role_id: true,
      is_active: true,
      role: {
        select: {
          id: true,
          name: true,
          is_allowed_shipment: true,
          is_allowed_do: true,
          is_allowed_location: true,
          is_allowed_truck: true,
          is_allowed_user: true,
          dc_id: true,
        },
      },
    },
  });
}

async function countUser(username, email, token, user_id) {
  let username_query = {};
  if (username != null) {
    username_query = {
      username: {
        equals: username,
        mode: "insensitive",
      },
    };
  }

  let email_query = {};
  if (email != null) {
    email_query = {
      email: {
        equals: email,
        mode: "insensitive",
      },
    };
  }

  let token_query = {};
  if (token != null) {
    token_query = {
      OR: [
        { web_token: token },
        { mobile_token: token },
      ],
    };
  }

  let user_id_query = {};
  if (user_id != null) {
    user_id_query = {
      id: user_id,
    };
  }

  return await prisma.user.count({
    where: {
      AND: [
        {
          OR: [username_query, email_query],
        },
        token_query,
        user_id_query,
      ],
    },
  });
}

export { createUser, updateUser, getUserDetails, getAllUsers, countUser };
