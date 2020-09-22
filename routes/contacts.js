const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { check, validationResult } = require("express-validator");

const User = require("../models/User");
const Contact = require("../models/Contact");

// @route     GET  api/contacts
// @desc      Get a user's contacts
// @access    Private

router.get("/", auth, async (req, res) => {
  try {
    const contacts = await Contact.find({ user: req.user.id }).sort({ date: -1 });
    res.json(contacts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route     POST  api/contacts
// @desc      Add new contact
// @access    Private

router.post("/", [auth, [check("name", "Name is required").not().isEmpty()]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, phone, type } = req.body;

  try {
    const newContact = new Contact({
      name,
      email,
      phone,
      type,
      user: req.user.id,
    });

    const contact = await newContact.save();
    res.json(contact);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route     PUT  api/contacts/:id
// @desc      Update contact
// @access    Private

router.put("/:id", auth, async (req, res) => {
  const { name, email, phone, type } = req.body;

  // create contact object using req.body data
  const contactFields = {};
  if (name) contactFields.name = name;
  if (phone) contactFields.phone = phone;
  if (email) contactFields.email = email;
  if (type) contactFields.type = type;

  try {
    let contact = await Contact.findById(req.params.id);

    if (!contact) return res.status(404).json({ msg: "Contact not found " });

    // make sure contact belongs to user
    if (contact.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Unauthorized action" });
    }
    // update fields or create new contact if doesn't already exist
    contact = await Contact.findByIdAndUpdate(req.params.id, { $set: contactFields }, { new: true });

    res.json(contact);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});
// @route     DELETE  api/contacts/:id
// @desc      Delete contact
// @access    Private

router.delete("/:id", auth, async (req, res) => {
  try {
    let contact = await Contact.findById(req.params.id);

    if (!contact) return res.status(404).json({ msg: "Contact not found" });

    if (contact.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Unauthorized action" });
    }

    await Contact.findByIdAndRemove(req.params.id);

    res.json({ msg: "Contact deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
