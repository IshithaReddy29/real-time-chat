const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const router = express.Router();


// SIGNUP
router.post("/signup", async (req, res) => {

    try {

        const { name, email, password } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {

            return res.status(400).json({
                message: "Email already exists"
            });

        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({

            name,
            email,
            password: hashedPassword

        });

        res.status(201).json({

            message: "User Registered Successfully"

        });

    } catch (err) {

        res.status(500).json({

            message: err.message

        });

    }

});



// LOGIN

router.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {

            return res.status(400).json({

                message: "Invalid Credentials"

            });

        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {

            return res.status(400).json({

                message: "Invalid Credentials"

            });

        }

        const token = jwt.sign(

            {

                id: user._id

            },

            process.env.JWT_SECRET,

            {

                expiresIn: "7d"

            }

        );

        res.json({

            token,

            user: {

                id: user._id,

                name: user.name,

                email: user.email

            }

        });

    } catch (err) {

        res.status(500).json({

            message: err.message

        });

    }

});

module.exports = router;