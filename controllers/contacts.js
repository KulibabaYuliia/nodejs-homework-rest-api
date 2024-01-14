// const fs = require("node:fs/promises");
// const path = require("node:path");
// const crypto = require("node:crypto");
const Contacts = require("../models/contacts");

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
});

const contactUpdateSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string().email(),
  phone: Joi.string(),
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

async function listContacts(_req, res, next) {
  try {
    const contacts = await Contacts.find();

    res.status(200).json(contacts);
  } catch (error) {
    next(error);
  }
}

async function getContactById(req, res, next) {
  try {
    const { contactId } = req.params;

    const result = await Contacts.findById(contactId);

    if (result === null) {
      return res.status(404).json({ message: "Not found" });
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function addContact(req, res, next) {
  try {
    const response = contactSchema.validate(req.body, { abortEarly: false });

    if (typeof response.error !== "undefined") {
      return res
        .status(400)
        .json({ message: response.error.details[0].message });
    }

    const result = await Contacts.create(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

async function removeContact(req, res, next) {
  const { contactId } = req.params;

  try {
    const result = await Contacts.findByIdAndDelete(contactId);

    if (result === null) {
      return res.status(404).json({ message: "Not found" });
    }

    res.status(200).json({ message: "contact deleted" });
  } catch (error) {
    next(error);
  }
}

async function updateContact(req, res, next) {
  try {
    const response = contactUpdateSchema.validate(req.body, {
      abortEarly: false,
    });

    if (typeof response.error !== "undefined") {
      return res
        .status(400)
        .json({ message: response.error.details[0].message });
    }

    const { contactId } = req.params;
    const result = await Contacts.findByIdAndUpdate(contactId, req.body, {
      new: true,
    });

    if (result === null) {
      return res.status(404).json({ message: "Not found" });
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function updateFavoriteContact(req, res, next) {
  try {
    const response = contactUpdateFavoriteSchema.validate(req.body, {
      abortEarly: false,
    });

    if (typeof response.error !== "undefined") {
      return res
        .status(400)
        .json({ message: response.error.details[0].message });
    }

    const { contactId } = req.params;

    const result = await Contacts.findByIdAndUpdate(
      contactId,
      {
        favorite: req.body.favorite,
      },
      { new: true }
    );

    if (result === null) {
      return res.status(404).json({ message: "Not found" });
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateFavoriteContact,
};
