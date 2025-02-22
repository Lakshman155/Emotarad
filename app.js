
const express = require("express");
const dotenv = require("dotenv");
const mongoose=require("mongoose");
const Contact=require("./models/contact");
// const bodyparser=require("body-parser");
// const connectDB = require("./config/db");
// const 
dotenv.config();
// connectDB();


const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));
// app.use(bodyparser.json())

// app.use(bodyparser.urlencoded({ extended: true }));

// app.use("/api", require("./routes/identify"));



const PORT = process.env.PORT || 3000;

const connect= async ()=>{


try {
    await mongoose.connect(process.env.MONGO_URI, {
      
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed", error);
    process.exit(1);
  }}
  connect();


  app.get('/',(req,res)=>{
    console.log('hii')
    res.send("hello world");
  })

  app.post("/identify", async (req, res) => {
    try {
      const { email, phone } = req.body;
      const phoneNumber=phone;
      if (!email && !phone) {
        return res.status(400).json({ error: "Email or phoneNumber is required" });
      }
  
      // Find all contacts matching the given email or phone number
      let matchingContacts = await Contact.find({
        $or: [{ email }, { phoneNumber }],
      });
  
      if (matchingContacts.length === 0) {
        // No match found, create a new primary contact
        const newContact = new Contact({ email, phoneNumber, linkPrecedence: "primary" });
        await newContact.save();
  
        return res.status(200).json({
          primaryContactId: newContact._id,
          emails: newContact.email ? [newContact.email] : [],
          phoneNumbers: newContact.phoneNumber ? [newContact.phoneNumber] : [],
          secondaryContactIds: [],
        });
      }
  
      // Find the primary contact (smallest `_id` is the main primary contact)
      let primaryContact = matchingContacts.find((c) => c.linkPrecedence === "primary");
      if (!primaryContact) {
        primaryContact = matchingContacts[0]; // Default to first contact
      }
  
      // Ensure all contacts link to the primary
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
  
      // If new email or phone is provided, add it as secondary
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
  
      // Prepare the response
      const emails = new Set();
      const phoneNumbers = new Set();
      const secondaryContactIds = [];
  
      // Include primary contact details
      if (primaryContact.email) emails.add(primaryContact.email);
      if (primaryContact.phoneNumber) phoneNumbers.add(primaryContact.phoneNumber);
  
      // Include secondary contact details
      updatedContacts.forEach((contact) => {
        if (contact.email) emails.add(contact.email);
        if (contact.phoneNumber) phoneNumbers.add(contact.phoneNumber);
        secondaryContactIds.push(contact._id);
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
  });


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


