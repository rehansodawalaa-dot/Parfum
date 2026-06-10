const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

/**
 * POST /api/auth/signup
 */
const signup = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phoneNumber, country, referralCode } = req.body;

    // Derive full name from first + last
    const name = `${firstName} ${lastName}`.trim();

    // Check for existing email
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    // Check for existing phone (if provided)
    if (phoneNumber) {
      const existingPhone = await User.findOne({ phoneNumber });
      if (existingPhone) {
        return res.status(409).json({ success: false, message: 'Phone number already registered.' });
      }
    }

    const userData = { name, firstName, lastName, email, password, phoneNumber: phoneNumber || '', country: country || '' };

    // Handle referral
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) {
        userData.referredBy = referrer._id;
        await User.findByIdAndUpdate(referrer._id, { $inc: { referralCount: 1 } });
      }
    }

    const user = await User.create(userData);

    // Generate referral code for new user
    user.referralCode = user.generateReferralCode();
    await user.save();

    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        id:           user._id,
        name:         user.name,
        firstName:    user.firstName,
        lastName:     user.lastName,
        email:        user.email,
        phoneNumber:  user.phoneNumber,
        country:      user.country,
        role:         user.role,
        referralCode: user.referralCode,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Explicitly select password (it's excluded by default)
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact support.' });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken(user._id);

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
        referralCode: user.referralCode,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

module.exports = { signup, login, getMe };
