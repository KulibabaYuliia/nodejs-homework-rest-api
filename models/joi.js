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

module.exports = {
  contactSchema,
  contactUpdateSchema,
  contactUpdateFavoriteSchema,
};
