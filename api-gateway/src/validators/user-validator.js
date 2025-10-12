import Joi from "joi";

const registerUserValidator = Joi.object({
  username: Joi.string().max(100).required(),
  password: Joi.string().max(100).required(),
  first_name: Joi.string().max(100).required(),
  last_name: Joi.string().max(100).required(),
  email: Joi.string().max(100).email().required(),
  phone_num: Joi.string().max(100).required(),
  role_id: Joi.number().required(),
  is_active: Joi.boolean().optional(),
});

const updateUserValidator = Joi.object({
  id: Joi.string().required(),
  username: Joi.string().max(100).optional(),
  first_name: Joi.string().max(100).optional(),
  last_name: Joi.string().max(100).optional(),
  email: Joi.string().max(100).email().optional(),
  phone_num: Joi.string().max(100).optional(),
  role_id: Joi.number().optional(),
  is_active: Joi.boolean().optional(),
});

const loginUserValidator = Joi.object({
  username: Joi.string().max(100).required(),
  password: Joi.string().max(100).required(),
});

const refreshTokenValidator = Joi.string().required();

export {
  registerUserValidator,
  updateUserValidator,
  loginUserValidator,
  refreshTokenValidator,
};
