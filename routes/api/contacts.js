const express = require("express");
const router = express.Router();

const contactsOpt = require("../../controllers/contacts.js");
const isValidId = require("../../middlewares/isValidId.js");

const jsonParser = express.json();

// contactsOpt.listContacts;

router.get("/", contactsOpt.listContacts);

router.get("/:contactId", isValidId, contactsOpt.getContactById);

router.post("/", jsonParser, contactsOpt.addContact);

router.delete("/:contactId", isValidId, contactsOpt.removeContact);

router.put("/:contactId", isValidId, jsonParser, contactsOpt.updateContact);

router.patch(
  "/:contactId/favorite",
  isValidId,
  jsonParser,
  contactsOpt.updateFavoriteContact
);

module.exports = router;
