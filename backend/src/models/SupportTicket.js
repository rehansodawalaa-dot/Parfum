const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender:    { type: String, enum: ['customer', 'admin'], required: true },
    text:      { type: String, required: true, maxlength: 2000, trim: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const supportTicketSchema = new mongoose.Schema(
  {
    // Pre-chat info collected before conversation starts
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
      index: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    // Linked user account (if logged in)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    messages: {
      type: [messageSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ['open', 'pending', 'resolved', 'closed'],
      default: 'open',
      index: true,
    },
    // Admin who last handled this ticket
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolvedAt:  { type: Date },
    lastReplyAt: { type: Date, default: Date.now },
    // Unique ticket reference number shown to users
    ticketNumber: { type: String, unique: true },
  },
  { timestamps: true }
);

// Auto-generate ticket number: JRS-TICKET-XXXXX
supportTicketSchema.pre('save', function (next) {
  if (!this.ticketNumber) {
    const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
    this.ticketNumber = `TKT-${rand}`;
  }
  next();
});

// Indexes for common admin queries
supportTicketSchema.index({ status: 1, createdAt: -1 });
supportTicketSchema.index({ email: 1, createdAt: -1 });

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
