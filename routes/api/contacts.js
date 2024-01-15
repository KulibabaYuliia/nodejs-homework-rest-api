const express = require("express");
const router = express.Router();

const contactsOpt = require("../../controllers/contacts.js");
const jsonParser = express.json();

router.get("/", contactsOpt.listContacts);

router.get("/:contactId", contactsOpt.getContactById);

router.post("/", jsonParser, contactsOpt.addContact);

router.delete("/:contactId", contactsOpt.removeContact);

router.put("/:contactId", jsonParser, contactsOpt.updateContact);

router.patch(
  "/:contactId/favorite",
  jsonParser,
  contactsOpt.updateFavoriteContact
);

module.exports = router;
