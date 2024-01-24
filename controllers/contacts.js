const Contacts = require("../models/contact");
const JoiSchems = require("../models/joi");
const mongoose = require("mongoose");

async function listContacts(req, res, next) {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const contacts = await Contacts.find({ owner: userId }, "-__v", {
      skip,
      limit,
    });

    if (contacts.length === 0) {
      return res.status(404).json({ message: "Not found" });
    }

    res.status(200).json(contacts);
  } catch (error) {
    next(error);
  }
}

async function getContactById(req, res, next) {
  try {
    const { contactId } = req.params;
    const userId = req.user.id;

    const contact = await Contacts.findById(contactId);

    if (contact === null) {
      return res.status(404).json({ message: "Not found" });
    }

    if (contact.owner.toString() !== userId) {
      return res.status(404).json({ message: "Not found" });
    }

    res.status(200).json(contact);
  } catch (error) {
    next(error);
  }
}

async function addContact(req, res, next) {
  try {
    const response = JoiSchems.contactSchema.validate(req.body, {
      abortEarly: false,
    });

    if (typeof response.error !== "undefined") {
      return res
        .status(400)
        .json({ message: response.error.details[0].message });
    }

    const owner = new mongoose.Types.ObjectId(req.user.id);

    const result = await Contacts.create({
      ...req.body,
      owner,
    });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

async function removeContact(req, res, next) {
  const { contactId } = req.params;
  const userId = req.user.id;

  try {
    const contact = await Contacts.findById(contactId);

    if (contact === null) {
      return res.status(404).json({ message: "Not found" });
    }

    if (contact.owner.toString() !== userId) {
      return res.status(404).json({ message: "Not found" });
    }

    await Contacts.deleteOne({ _id: contactId });

    res.status(200).json({ message: "contact deleted" });
  } catch (error) {
    next(error);
  }
}

async function updateContact(req, res, next) {
  try {
    const response = JoiSchems.contactUpdateSchema.validate(req.body, {
      abortEarly: false,
    });

    if (typeof response.error !== "undefined") {
      return res
        .status(400)
        .json({ message: response.error.details[0].message });
    }

    const { contactId } = req.params;
    const userId = req.user.id;

    const result = await Contacts.findById(contactId);

    if (result === null) {
      return res.status(404).json({ message: "Not found" });
    }

    if (result.owner.toString() !== userId) {
      return res.status(404).json({ message: "Not found" });
    }

    const contact = await Contacts.findByIdAndUpdate(contactId, req.body, {
      new: true,
    });

    if (contact === null) {
      return res.status(404).json({ message: "Not found" });
    }

    res.status(200).json(contact);
  } catch (error) {
    next(error);
  }
}

async function updateFavoriteContact(req, res, next) {
  try {
    const response = JoiSchems.contactUpdateFavoriteSchema.validate(req.body, {
      abortEarly: false,
    });

    if (typeof response.error !== "undefined") {
      return res
        .status(400)
        .json({ message: response.error.details[0].message });
    }

    const { contactId } = req.params;
    const userId = req.user.id;

    const result = await Contacts.findById(contactId);

    if (result === null) {
      return res.status(404).json({ message: "Not found" });
    }

    if (result.owner.toString() !== userId) {
      return res.status(404).json({ message: "Not found" });
    }

    const contact = await Contacts.findByIdAndUpdate(
      contactId,
      {
        favorite: req.body.favorite,
      },
      { new: true }
    );

    if (contact === null) {
      return res.status(404).json({ message: "Not found" });
    }

    res.status(200).json(contact);
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
