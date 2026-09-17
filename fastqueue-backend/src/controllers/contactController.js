import Contact from "../models/Contact.js";
import sendEmail from "../../utils/sendEmail.js";



export const submitContactMessage = async (req, res, next) => {
  try {
    const { fullName, email, subject, message } = req.body;

    // Validate required fields
    if (!fullName || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all fields.",
      });
    }

    // Create contact message
    const contact = await Contact.create({
      fullName,
      email,
      subject,
      message,
    });

    return res.status(201).json({
      success: true,
      message: "Your message has been sent successfully.",
      contact,
    });
  } catch (error) {
    next(error);
  }
};