const Joi = require("joi");

const contactSchema = Joi.object({
  name: Joi.string().required().messages({
    "any.required": `missing required name field`,
  }),
  email: Joi.string().email().required().messages({
    "any.required": `missing required email field`,
  }),
  phone: Joi.string().required().messages({
    "any.required": `missing required phone field`,
  }),
  favorite: Joi.boolean().required().messages({
    "any.required": `missing required favorite field`,
  }),
});

const contactUpdateSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string().email(),
  phone: Joi.string(),
  favorite: Joi.boolean(),
})
  .required()
  .min(1)
  .messages({
    "object.min": "missing fields",
  });

const contactUpdateFavoriteSchema = Joi.object({
  favorite: Joi.boolean(),
})
  .required()
  .min(1)
  .messages({
    "object.min": "missing field favorite",
  });

const userSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "any.required": `missing required email field`,
  }),
  password: Joi.string().required().messages({
    "any.required": `missing required password field`,
  }),
});

const subscriptionSchema = Joi.object({
  subscription: Joi.string()
    .valid("starter", "pro", "business")
    .required()
    .messages({
      "any.required": `missing required subscription field`,
    }),
});

module.exports = {
  contactSchema,
  contactUpdateSchema,
  contactUpdateFavoriteSchema,
  userSchema,
  subscriptionSchema,
};
