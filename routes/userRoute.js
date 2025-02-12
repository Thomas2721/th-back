const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User  = require("../models/userModel.js");


const router = express.Router();



router.post("/signup", async (request, response) => {
  try {
    const { username, password, email } = request.body;
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return response
        .status(400)
        .json({ message: "username or email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    return response.status(201).json(newUser);
  } catch (error) {
    response.status(500).send({ message: error.message });
  }
});

router.post("/signin", async (request, response) => {
  try {
    const { username, password } = request.body;
    const user = await User.findOne({ username });

    if (!user) {
      return response.status(401).json({ message: "user not found" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return response.status(401).json({ message: "invalid password" });
    }
    const token = jwt.sign(
      { userId: user._id, islogged: true },
      "thomas",
      { expiresIn: "5hr" }
    );
    return response.status(200).json({ token, username: user.username });
  
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

module.exports = router;
