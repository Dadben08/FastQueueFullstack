import Ticket from "../models/Ticket.js";
import Company from "../models/Company.js";

/*
  Helper:
  Get the company belonging to the logged-in user.
*/
const getUserCompany = async (userId) => {
  return await Company.findOne({ owner: userId });
};


/*
  ==========================================
  JOIN QUEUE
  POST /api/queue/join
  PUBLIC
  ==========================================
*/
export const joinQueue = async (req, res, next) => {
  try {
    const {
      companyId,
      customerName,
      customerPhone,
      customerEmail,
      sex,
      service,
    } = req.body;

    console.log("JOIN QUEUE REQUEST:", req.body);

    // --------------------------------------
    // Validate required fields
    // --------------------------------------

    if (!companyId) {
      return res.status(400).json({
        message: "Company ID is required.",
      });
    }

    if (!customerName?.trim()) {
      return res.status(400).json({
        message: "Customer name is required.",
      });
    }

    if (!service?.trim()) {
      return res.status(400).json({
        message: "Service is required.",
      });
    }

    // --------------------------------------
    // Find the selected company
    // --------------------------------------

    const company = await Company.findById(companyId);

    if (!company) {
      return res.status(404).json({
        message: "Company not found.",
      });
    }

    // --------------------------------------
    // Start/end of today
    // --------------------------------------

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // --------------------------------------
    // Find last ticket for this company today
    // --------------------------------------

    const lastTicket = await Ticket.findOne({
      company: company._id,
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    }).sort({ position: -1 });

    const position = lastTicket
      ? lastTicket.position + 1
      : 1;

    // --------------------------------------
    // Generate ticket number
    // Use company's queue prefix
    // --------------------------------------

    const prefix = company.queuePrefix || "A";

    const ticketNumber = `${prefix}${String(position).padStart(3, "0")}`;

    // --------------------------------------
    // Create ticket
    // --------------------------------------

    const ticket = await Ticket.create({
      company: company._id,

      customerName: customerName.trim(),

      customerPhone: customerPhone?.trim() || "",

      customerEmail: customerEmail?.trim() || "",

      sex: sex || "",

      service: service.trim(),

      ticketNumber,

      position,

      status: "waiting",

      joinedAt: new Date(),
    });

    // --------------------------------------
    // Success
    // --------------------------------------

    return res.status(201).json({
      message: "Successfully joined the queue.",
      ticket,
      company: {
        _id: company._id,
        name: company.name,
        queueName: company.queueName,
      },
    });

  } catch (error) {
    console.error("JOIN QUEUE ERROR:", error);
    next(error);
  }
};


/*
  ==========================================
  GET TODAY'S QUEUE
  GET /api/queue/today
  PROTECTED
  ==========================================
*/
export const getTodayQueue = async (req, res, next) => {
  try {
    const company = await getUserCompany(req.user._id);

    if (!company) {
      return res.status(404).json({
        message: "Company not found.",
      });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const tickets = await Ticket.find({
      company: company._id,
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    }).sort({ position: 1 });

    return res.status(200).json({
      count: tickets.length,
      tickets,
    });

  } catch (error) {
    console.error("GET TODAY QUEUE ERROR:", error);
    next(error);
  }
};


/*
  ==========================================
  GET QUEUE STATISTICS
  GET /api/queue/stats
  PROTECTED
  ==========================================
*/
export const getQueueStats = async (req, res, next) => {
  try {
    const company = await getUserCompany(req.user._id);

    if (!company) {
      return res.status(404).json({
        message: "Company not found.",
      });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayTickets = await Ticket.find({
      company: company._id,
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    const stats = {
      total: todayTickets.length,

      waiting: todayTickets.filter(
        (ticket) => ticket.status === "waiting"
      ).length,

      serving: todayTickets.filter(
        (ticket) => ticket.status === "serving"
      ).length,

      completed: todayTickets.filter(
        (ticket) => ticket.status === "completed"
      ).length,

      skipped: todayTickets.filter(
        (ticket) => ticket.status === "skipped"
      ).length,
    };

    return res.status(200).json(stats);

  } catch (error) {
    console.error("GET QUEUE STATS ERROR:", error);
    next(error);
  }
};


/*
  ==========================================
  CALL NEXT CUSTOMER
  PUT /api/queue/next
  PROTECTED
  ==========================================
*/
/*
  ==========================================
  CALL NEXT CUSTOMER
  PUT /api/queue/next
  PROTECTED
  ==========================================
*/
export const callNextCustomer = async (req, res, next) => {
  try {
    const company = await getUserCompany(req.user._id);

    if (!company) {
      return res.status(404).json({
        message: "Company not found.",
      });
    }

    // --------------------------------------
    // Start/end of today
    // --------------------------------------

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // --------------------------------------
    // Check if somebody is currently being
    // served TODAY
    // --------------------------------------

    const currentServing = await Ticket.findOne({
      company: company._id,
      status: "serving",
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    if (currentServing) {
      return res.status(400).json({
        message:
          "A customer is already being served. Complete or skip the current customer first.",
        ticket: currentServing,
      });
    }

    // --------------------------------------
    // Find the next waiting customer TODAY
    // --------------------------------------

    const nextTicket = await Ticket.findOne({
      company: company._id,
      status: "waiting",
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    }).sort({ position: 1 });

    // --------------------------------------
    // Nobody is waiting
    // --------------------------------------

    if (!nextTicket) {
      return res.status(200).json({
        message: "There are no customers waiting.",
        ticket: null,
      });
    }

    // --------------------------------------
    // Move customer to serving
    // --------------------------------------

    nextTicket.status = "serving";
    nextTicket.calledAt = new Date();

    await nextTicket.save();

    // --------------------------------------
    // Success
    // --------------------------------------

    return res.status(200).json({
      message: "Next customer called successfully.",
      ticket: nextTicket,
    });

  } catch (error) {
    console.error("CALL NEXT ERROR:", error);
    next(error);
  }
};


/*
  ==========================================
  COMPLETE CUSTOMER
  PUT /api/queue/:id/complete
  PROTECTED
  ==========================================
*/
export const completeCustomer = async (req, res, next) => {
  try {
    const company = await getUserCompany(req.user._id);

    if (!company) {
      return res.status(404).json({
        message: "Company not found.",
      });
    }

    const ticket = await Ticket.findOne({
      _id: req.params.id,
      company: company._id,
    });

    if (!ticket) {
      return res.status(404).json({
        message: "Queue ticket not found.",
      });
    }

    if (ticket.status !== "serving") {
      return res.status(400).json({
        message:
          "Only a customer currently being served can be completed.",
      });
    }

    ticket.status = "completed";
    ticket.completedAt = new Date();

    await ticket.save();

    return res.status(200).json({
      message: "Customer completed successfully.",
      ticket,
    });

  } catch (error) {
    console.error("COMPLETE CUSTOMER ERROR:", error);
    next(error);
  }
};


/*
  ==========================================
  SKIP CUSTOMER
  PUT /api/queue/:id/skip
  PROTECTED
  ==========================================
*/
export const skipCustomer = async (req, res, next) => {
  try {
    const company = await getUserCompany(req.user._id);

    if (!company) {
      return res.status(404).json({
        message: "Company not found.",
      });
    }

    const ticket = await Ticket.findOne({
      _id: req.params.id,
      company: company._id,
    });

    if (!ticket) {
      return res.status(404).json({
        message: "Queue ticket not found.",
      });
    }

    if (ticket.status !== "serving") {
      return res.status(400).json({
        message:
          "Only a customer currently being served can be skipped.",
      });
    }

    ticket.status = "skipped";
    ticket.completedAt = new Date();

    await ticket.save();

    return res.status(200).json({
      message: "Customer skipped successfully.",
      ticket,
    });

  } catch (error) {
    console.error("SKIP CUSTOMER ERROR:", error);
    next(error);
  }
};
/*
  ==========================================
  GET CUSTOMER TICKET STATUS
  GET /api/queue/ticket/:id
  PUBLIC
  ==========================================
*/
export const getTicketStatus = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate(
      "company",
      "name queueName"
    );

    if (!ticket) {
      return res.status(404).json({
        message: "Queue ticket not found.",
      });
    }

    // Find customers ahead of this ticket
    const peopleAhead = await Ticket.countDocuments({
      company: ticket.company._id,
      status: "waiting",
      position: { $lt: ticket.position },
    });

    // Find the customer currently being served
    const currentlyServing = await Ticket.findOne({
      company: ticket.company._id,
      status: "serving",
    }).select("ticketNumber position");

    return res.status(200).json({
      ticket: {
        _id: ticket._id,
        ticketNumber: ticket.ticketNumber,
        position: ticket.position,
        status: ticket.status,
        customerName: ticket.customerName,
        service: ticket.service,
        joinedAt: ticket.joinedAt,
        calledAt: ticket.calledAt,
        completedAt: ticket.completedAt,
      },

      peopleAhead,

      currentlyServing: currentlyServing
        ? {
            ticketNumber: currentlyServing.ticketNumber,
            position: currentlyServing.position,
          }
        : null,
    });
  } catch (error) {
    console.error("GET TICKET STATUS ERROR:", error);
    next(error);
  }
};

/*
  ==========================================
  SEND TICKET BY EMAIL
  POST /api/queue/send-ticket
  PUBLIC
  ==========================================
*/
export const sendTicketEmail = async (req, res, next) => {
  try {
    const { ticketId, email } = req.body;

    // --------------------------------------
    // Validate
    // --------------------------------------

    if (!ticketId) {
      return res.status(400).json({
        message: "Ticket ID is required.",
      });
    }

    if (!email?.trim()) {
      return res.status(400).json({
        message: "Email address is required.",
      });
    }

    // --------------------------------------
    // Find ticket
    // --------------------------------------

    const ticket = await Ticket.findById(ticketId).populate(
      "company",
      "name queueName"
    );

    if (!ticket) {
      return res.status(404).json({
        message: "Queue ticket not found.",
      });
    }

    // --------------------------------------
    // Create mail transporter
    // --------------------------------------

    const nodemailer = await import("nodemailer");

    const transporter = nodemailer.default.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    // --------------------------------------
    // Send email
    // --------------------------------------

    await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.MAIL_USER,
      to: email.trim(),

      subject: `Your FastQueue Ticket - ${ticket.ticketNumber}`,

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: auto;
          padding: 30px;
          background: #f9fafb;
          border-radius: 15px;
        ">

          <h1 style="color: #f4400d;">
            FastQueue
          </h1>

          <h2>
            Your Queue Ticket
          </h2>

          <p>
            Hello <strong>${ticket.customerName}</strong>,
          </p>

          <p>
            You have successfully joined the queue at
            <strong>${ticket.company?.name || "the company"}</strong>.
          </p>

          <div style="
            background: white;
            padding: 25px;
            margin: 25px 0;
            border-radius: 15px;
            text-align: center;
            border: 2px solid #f4400d;
          ">

            <p style="color: #666;">
              Your Queue Number
            </p>

            <h1 style="
              font-size: 48px;
              color: #f4400d;
              margin: 10px 0;
            ">
              ${ticket.ticketNumber}
            </h1>

            <p>
              Position:
              <strong>${ticket.position}</strong>
            </p>

            <p>
              Service:
              <strong>${ticket.service}</strong>
            </p>

          </div>

          <p>
            Please keep this ticket number safe. You can use it to
            check your queue status.
          </p>

          <p style="color: #777;">
            Thank you for using FastQueue.
          </p>

        </div>
      `,
    });

    // --------------------------------------
    // Success
    // --------------------------------------

    return res.status(200).json({
      message: "Ticket sent successfully to your email.",
    });

  } catch (error) {
    console.error("SEND TICKET EMAIL ERROR:", error);

    return res.status(500).json({
      message: "Unable to send ticket email.",
    });
  }
};