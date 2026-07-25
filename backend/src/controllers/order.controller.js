const crypto = require('crypto');
const Order  = require('../models/Order');
const Product = require('../models/Product');
const Coupon  = require('../models/Coupon');
const { sendMail } = require('../config/mailer');

/**
 * POST /api/orders/create
 * Creates a Razorpay order + pending Order document.
 */
const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, couponCode } = req.body;

    if (!items?.length) {
      return res.status(400).json({ success: false, message: 'Cart is empty.' });
    }

    // Validate products and build line items
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) {
        return res.status(400).json({ success: false, message: `Product "${item.name}" is no longer available.` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Only ${product.stock} units of "${product.name}" are in stock.` });
      }
      orderItems.push({
        product:  product._id,
        name:     product.name,
        brand:    product.brand,
        image:    product.images?.[0] || '',
        size:     item.size,
        quantity: item.quantity,
        price:    product.price,
      });
      subtotal += product.price * item.quantity;
    }

    // ── Apply coupon ────────────────────────────────────────────────────────
    let discount   = 0;
    let appliedCode = '';

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase().trim() });
      if (coupon && coupon.isActive) {
        const expired = coupon.expiresAt && new Date() > coupon.expiresAt;
        const limitHit = coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit;
        const meetsMin = subtotal >= coupon.minOrderValue;

        // Per-user limit check
        const usedByUser = await Order.countDocuments({
          user: req.user._id,
          couponCode: coupon.code,
          paymentStatus: 'paid',
        });
        const perUserOk = usedByUser < (coupon.perUserLimit ?? 1);

        // Specific user check
        const scopeOk = coupon.specificUsers.length === 0 ||
          coupon.specificUsers.map(u => u.toString()).includes(req.user._id.toString());

        if (!expired && !limitHit && meetsMin && perUserOk && scopeOk) {
          discount    = coupon.calcDiscount(subtotal);
          appliedCode = coupon.code;
        }
      }
    }

    const tax      = Math.round(subtotal * 0.18);
    const shipping = subtotal >= 3000 ? 0 : 299;
    const total    = Math.max(0, subtotal + tax + shipping - discount);

    // Create Razorpay order
    const razorpay = require('../config/razorpay');
    const rzpOrder = await razorpay.orders.create({
      amount:   total * 100, // paise
      currency: 'INR',
      receipt:  `rcpt_${Date.now()}`,
      notes:    { userId: req.user._id.toString() },
    });

    // Persist pending order
    const order = await Order.create({
      user:            req.user._id,
      items:           orderItems,
      shippingAddress,
      subtotal,
      tax,
      shipping,
      discount,
      couponCode:      appliedCode,
      total,
      razorpayOrderId: rzpOrder.id,
      paymentStatus:   'pending',
      status:          'pending',
    });

    res.status(201).json({
      success: true,
      order: {
        id:              order._id,
        orderNumber:     order.orderNumber,
        subtotal,
        tax,
        shipping,
        discount,
        couponCode:      appliedCode,
        total,
        razorpayOrderId: rzpOrder.id,
        amount:          rzpOrder.amount,
        currency:        rzpOrder.currency,
      },
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/orders/verify
 * Verifies Razorpay signature and confirms the order.
 */
const verifyOrder = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expected !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed.' });
    }

    const order = await Order.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature,
        paymentStatus: 'paid',
        status:        'confirmed',
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Deduct stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }

    // Increment coupon usage
    if (order.couponCode) {
      await Coupon.findOneAndUpdate(
        { code: order.couponCode },
        { $inc: { usedCount: 1 } }
      );
    }

    res.json({
      success: true,
      message: 'Order confirmed.',
      order: {
        id:          order._id,
        orderNumber: order.orderNumber,
        total:       order.total,
        status:      order.status,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/orders/my
 * Returns the authenticated user's orders.
 */
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select('-razorpaySignature')
      .populate('items.product', 'name slug images');

    res.json({ success: true, orders });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/orders/:id
 * Returns a single order (must belong to the user).
 */
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
      .select('-razorpaySignature')
      .populate('items.product', 'name slug images');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/admin/orders/:id/status
 * Admin: update order status.
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, trackingNumber, carrier } = req.body;
    const update = { status };
    if (trackingNumber) update.trackingNumber = trackingNumber;
    if (carrier)        update.carrier = carrier;
    if (status === 'shipped')   update.shippedAt   = new Date();
    if (status === 'delivered') update.deliveredAt = new Date();

    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    res.json({ success: true, message: 'Order status updated.', order });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/orders
 * Admin: all orders with pagination.
 */
const getAllOrders = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip  = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'name email')
        .select('-razorpaySignature'),
      Order.countDocuments(filter),
    ]);

    res.json({ success: true, total, page, orders });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/orders/:id/tracking
 * Returns tracking timeline for a user's order.
 */
const getOrderTracking = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
      .select('orderNumber status trackingNumber courierPartner carrier trackingTimeline shippedAt deliveredAt createdAt');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    res.json({ success: true, tracking: order });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/admin/orders/:id/tracking
 * Admin: update tracking info and push a timeline event.
 */
const updateOrderTracking = async (req, res, next) => {
  try {
    const { trackingNumber, courierPartner, carrier, status, timelineMessage } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    if (trackingNumber)  order.trackingNumber  = trackingNumber;
    if (courierPartner)  order.courierPartner  = courierPartner;
    if (carrier)         order.carrier         = carrier;
    if (status) {
      order.status = status;
      if (status === 'shipped')   order.shippedAt   = new Date();
      if (status === 'delivered') order.deliveredAt = new Date();

      // Push a timeline entry automatically
      order.trackingTimeline.push({
        status,
        message:   timelineMessage || statusDefaultMessage(status),
        timestamp: new Date(),
      });
    }

    await order.save();
    res.json({ success: true, message: 'Tracking updated.', order });
  } catch (err) {
    next(err);
  }
};

function statusDefaultMessage(status) {
  const map = {
    confirmed:         'Payment confirmed. Your order is being prepared.',
    processing:        'Your order is being processed.',
    packed:            'Your order has been packed and is ready to ship.',
    shipped:           'Your order has been shipped.',
    out_for_delivery:  'Your order is out for delivery.',
    delivered:         'Your order has been delivered. Enjoy!',
    cancelled:         'Your order has been cancelled.',
  };
  return map[status] || `Order status updated to ${status}.`;
}

/* ── Email helpers ─────────────────────────────────────────────────────────── */

function buildAdminCODEmail(order, address) {
  const itemRows = order.items.map((i) =>
    `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #f0ebe3">${i.name} (${i.size})</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0ebe3;text-align:center">${i.quantity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0ebe3;text-align:right">₹${(i.price * i.quantity).toLocaleString('en-IN')}</td>
    </tr>`
  ).join('');

  return `
    <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#fffdf8;border:1px solid #e8e0d0;padding:32px">
      <h1 style="font-size:22px;color:#0a0a0a;margin:0 0 4px">🛍️ New COD Order — Action Required</h1>
      <p style="color:#888;font-size:13px;margin:0 0 24px">Order <strong style="color:#0a0a0a">${order.orderNumber}</strong> placed via Cash on Delivery</p>

      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        <thead>
          <tr style="background:#f5f0e8">
            <th style="padding:8px 12px;text-align:left;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#888">Item</th>
            <th style="padding:8px 12px;text-align:center;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#888">Qty</th>
            <th style="padding:8px 12px;text-align:right;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#888">Amount</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <table style="width:100%;margin-bottom:24px">
        <tr><td style="color:#888;font-size:13px;padding:2px 0">Subtotal</td><td style="text-align:right;font-size:13px">₹${order.subtotal.toLocaleString('en-IN')}</td></tr>
        <tr><td style="color:#888;font-size:13px;padding:2px 0">GST (18%)</td><td style="text-align:right;font-size:13px">₹${order.tax.toLocaleString('en-IN')}</td></tr>
        <tr><td style="color:#888;font-size:13px;padding:2px 0">Shipping</td><td style="text-align:right;font-size:13px">${order.shipping === 0 ? 'Free' : '₹' + order.shipping}</td></tr>
        ${order.discount > 0 ? `<tr><td style="color:#16a34a;font-size:13px;padding:2px 0">Coupon (${order.couponCode})</td><td style="text-align:right;font-size:13px;color:#16a34a">−₹${order.discount.toLocaleString('en-IN')}</td></tr>` : ''}
        <tr style="border-top:1px solid #e8e0d0"><td style="font-weight:700;font-size:15px;padding:8px 0 2px">Total (Collect on Delivery)</td><td style="text-align:right;font-weight:700;font-size:15px;padding:8px 0 2px">₹${order.total.toLocaleString('en-IN')}</td></tr>
      </table>

      <div style="background:#f5f0e8;padding:16px;margin-bottom:24px">
        <p style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#888;margin:0 0 8px">Deliver To</p>
        <p style="margin:0;font-size:14px;color:#0a0a0a;font-weight:600">${address.fullName}</p>
        <p style="margin:4px 0 0;font-size:13px;color:#555">${address.line1}${address.line2 ? ', ' + address.line2 : ''}</p>
        <p style="margin:2px 0 0;font-size:13px;color:#555">${address.city}, ${address.state} — ${address.pincode}</p>
        <p style="margin:2px 0 0;font-size:13px;color:#555">📞 ${address.phone}</p>
        <p style="margin:2px 0 0;font-size:13px;color:#555">✉️ ${address.email}</p>
      </div>

      <p style="font-size:12px;color:#aaa;text-align:center;margin:0">J Raph Streach · COD Order Notification</p>
    </div>
  `;
}

/**
 * POST /api/orders/cod
 * Places a Cash on Delivery order — no payment gateway involved.
 * Notifies admin via email.
 */
const createCODOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, couponCode } = req.body;

    if (!items?.length) {
      return res.status(400).json({ success: false, message: 'Cart is empty.' });
    }

    // Validate products and build line items
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) {
        return res.status(400).json({ success: false, message: `Product "${item.name}" is no longer available.` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Only ${product.stock} units of "${product.name}" are in stock.` });
      }
      orderItems.push({
        product:  product._id,
        name:     product.name,
        brand:    product.brand,
        image:    product.images?.[0] || '',
        size:     item.size,
        quantity: item.quantity,
        price:    product.price,
      });
      subtotal += product.price * item.quantity;
    }

    // Apply coupon
    let discount    = 0;
    let appliedCode = '';

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase().trim() });
      if (coupon && coupon.isActive) {
        const expired    = coupon.expiresAt && new Date() > coupon.expiresAt;
        const limitHit   = coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit;
        const meetsMin   = subtotal >= coupon.minOrderValue;
        const usedByUser = await Order.countDocuments({ user: req.user._id, couponCode: coupon.code, paymentStatus: 'paid' });
        const perUserOk  = usedByUser < (coupon.perUserLimit ?? 1);
        const scopeOk    = coupon.specificUsers.length === 0 || coupon.specificUsers.map(u => u.toString()).includes(req.user._id.toString());

        if (!expired && !limitHit && meetsMin && perUserOk && scopeOk) {
          discount    = coupon.calcDiscount(subtotal);
          appliedCode = coupon.code;
        }
      }
    }

    const tax      = Math.round(subtotal * 0.18);
    const shipping = subtotal >= 3000 ? 0 : 299;
    const total    = Math.max(0, subtotal + tax + shipping - discount);

    // Create order — confirmed immediately, payment collected on delivery
    const order = await Order.create({
      user:            req.user._id,
      items:           orderItems,
      shippingAddress,
      subtotal,
      tax,
      shipping,
      discount,
      couponCode:      appliedCode,
      total,
      paymentMethod:   'cod',
      paymentStatus:   'pending',  // will be marked paid on delivery
      status:          'confirmed',
    });

    // Deduct stock immediately
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }

    // Increment coupon usage
    if (appliedCode) {
      await Coupon.findOneAndUpdate({ code: appliedCode }, { $inc: { usedCount: 1 } });
    }

    // Notify admin via email (non-blocking)
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      sendMail({
        to:      adminEmail,
        subject: `[COD] New Order ${order.orderNumber} — ₹${total.toLocaleString('en-IN')}`,
        html:    buildAdminCODEmail(order, shippingAddress),
      });
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully. Pay on delivery.',
      order: {
        id:          order._id,
        orderNumber: order.orderNumber,
        total:       order.total,
        status:      order.status,
        paymentMethod: 'cod',
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, verifyOrder, getMyOrders, getOrderById, updateOrderStatus, getAllOrders, getOrderTracking, updateOrderTracking, createCODOrder };
