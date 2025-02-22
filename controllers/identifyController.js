
const Contact = require("../models/contact");

exports.identify = async (req, res) => {
  try {
    const { email, phone } = req.body;
    const phoneNumber = phone;

    if (!email && !phone) {
      return res.status(400).json({ error: "Email or phoneNumber is required" });
    }

    // 🔎 **Find all contacts matching the given email or phone number**
    let matchingContacts = await Contact.find({
      $or: [{ email }, { phoneNumber }],
    });

    if (matchingContacts.length === 0) {
      // 🎯 **No match found, create a new primary contact**
      const newContact = new Contact({
        email,
        phoneNumber,
        linkPrecedence: "primary",
      });
      await newContact.save();

      return res.status(200).json({
        primaryContactId: newContact._id,
        emails: newContact.email ? [newContact.email] : [],
        phoneNumbers: newContact.phoneNumber ? [newContact.phoneNumber] : [],
        secondaryContactIds: [],
      });
    }

    // 🔗 **Find the actual primary contact**
    let primaryContact = matchingContacts.find((c) => c.linkPrecedence === "primary");

    if (!primaryContact) {
      // If no primary found, assume the first contact is primary
      primaryContact = matchingContacts[0];
    }

    // Ensure we always link to the correct primary contact
    for (let contact of matchingContacts) {
      if (contact.linkPrecedence === "secondary" && contact.linkedId) {
        let actualPrimary = await Contact.findById(contact.linkedId);
        if (actualPrimary) {
          primaryContact = actualPrimary;
        }
      }
    }

    // 🔄 **Ensure all secondary contacts link to the same primary**
    let updatedContacts = [];
    for (let contact of matchingContacts) {
      if (contact._id.toString() !== primaryContact._id.toString()) {
        if (contact.linkPrecedence !== "secondary") {
          contact.linkPrecedence = "secondary";
          contact.linkedId = primaryContact._id;
          await contact.save();
        }
        updatedContacts.push(contact);
      }
    }

    // 🆕 **If a new email or phone is provided, link it as a secondary**
    let newSecondaryContact = null;
    if (
      (email && !matchingContacts.some((c) => c.email === email)) ||
      (phoneNumber && !matchingContacts.some((c) => c.phoneNumber === phoneNumber))
    ) {
      newSecondaryContact = new Contact({
        email,
        phoneNumber,
        linkPrecedence: "secondary",
        linkedId: primaryContact._id,
      });
      await newSecondaryContact.save();
      updatedContacts.push(newSecondaryContact);
    }

    // 🔍 **Find all contacts related to the primary account**
    let allRelatedContacts = await Contact.find({
      $or: [{ _id: primaryContact._id }, { linkedId: primaryContact._id }],
    });

    // 📝 **Prepare the response**
    const emails = new Set();
    const phoneNumbers = new Set();
    const secondaryContactIds = [];

    allRelatedContacts.forEach((contact) => {
      if (contact.email) emails.add(contact.email);
      if (contact.phoneNumber) phoneNumbers.add(contact.phoneNumber);
      if (contact._id.toString() !== primaryContact._id.toString()) {
        secondaryContactIds.push(contact._id);
      }
    });

    return res.status(200).json({
      primaryContactId: primaryContact._id,
      emails: Array.from(emails),
      phoneNumbers: Array.from(phoneNumbers),
      secondaryContactIds,
    });
  } catch (error) {
    console.error("Error processing /identify:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
