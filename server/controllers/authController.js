const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Generate JWT (secret mocked for hackathon)
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "SUPER_SECRET_HACKATHON_KEY", {
    expiresIn: "30d",
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  const { name, email, password, defaultRoom } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ error: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      defaultRoom,
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        defaultRoom: user.defaultRoom,
        token: generateToken(user.id),
      });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ error: "Server error during registration" });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        defaultRoom: user.defaultRoom,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ error: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ error: "Server error during login" });
  }
};

module.exports = { registerUser, loginUser };
