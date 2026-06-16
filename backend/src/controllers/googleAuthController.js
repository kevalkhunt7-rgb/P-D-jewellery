import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import crypto from 'crypto'; // Native Node.js module—no installation required
import User from '../model/userModel.js'; 

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Google OAuth Login / Auto-Registration Handler
// @route   POST /api/auth/google
// @access  Public
export const googleLogin = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, message: 'Google token payload is missing' });
  }

  try {
    // 1. Handshake verification with Google Security API servers
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // 2. Locate user or create a new account if they don't exist yet
    let user = await User.findOne({ email });

    if (!user) {
      // FIX: Generate a strong, random 32-character temporary string fallback.
      // This satisfies Mongoose 'required: true' schema constraints cleanly.
      const fallbackPassword = crypto.randomBytes(16).toString('hex');

      user = new User({
        name,
        email,
        password: fallbackPassword, // Bypasses password validation restrictions safely
        avatar: picture,
        isVerified: true, 
      });
      
      await user.save();
      console.log(`Successfully provisioned new account via Google OAuth: ${email}`);
    }

    // 3. Generate your own internal app JWT token structure
    const appToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 4. Return authorization parameters to the React application
    return res.status(200).json({
      success: true,
      token: appToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || picture,
      },
    });

  } catch (error) {
    console.error('Google verification backend failure exception:', error);
    
    // INTEGRATION FIX: If the database save operation fails, intercept it here 
    // to prevent misleading 401 token authentication errors on your frontend.
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: `Database Validation Failed: Missing fields or schema conflict. Details: ${error.message}`,
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Google authentication failed. Provided token signature is invalid.',
    });
  }
};