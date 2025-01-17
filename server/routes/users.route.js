const express = require("express")
const router = express.Router();

const User = require("../models/User.model") //import User Model
const bcrypt = require("bcrypt") // import bcrypt to hash the passwords

// import cookie-parser to store JWT token in a cookie
const cookieParser = require("cookie-parser")
router.use(cookieParser()); // this middleware is applied to every request

// import JWT middleware
const { createTokens, validateToken } = require("../middlewares/JWT")


// create user authentication

// handle user registration
router.post("/register", async (req, res) => {
    const { username, password, email, ...rest } = req.body;
    try {
        const hash = await bcrypt.hash(password, 10); // hash the password

        // Check if the username already exists
        const existingUsername = await User.findOne({ where: { username: username } });
        if (existingUsername) {
            throw { message: "Username already exists!" };
        }

        // Check if Email already exists
        const existingEmail = await User.findOne({ where: { email: email } });
        if (existingEmail) { // check if user name already stored
            throw { message: "You already have an account!" };
        }

        // Create new User Object 
        await User.create({
            username: username,
            password: hash,
            email: email
        });

        const accessToken = createTokens({ username: username, email: email }); // Create a new JWT token
        res.cookie("access-token", accessToken, { maxAge: 60 * 30 * 1000 }); // Create a new cookie, store the JWT token in it, and then send the cookie to the front end for storage
        res.json({ userData:{username, email, isAuthenticated: true}, access_token:accessToken });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


// handle user login
router.post("/login", async (req, res) => {
    const { username, password, email } = req.body;

    // check if the user already exists
    const user = await User.findOne({ where: { username: username } });

    if (!user) {
        return res.status(400).json({ error: "username or password is wrong!" })
    }

    const dbPassword = user.password;

    // Check if password is correct
    bcrypt.compare(password, dbPassword).then((match) => {
        if (!match)// if password do not match this will be false
        {
            res.status(400).json({ error: "username or password is wrong!" })
        } else {
            const accessToken = createTokens(user) // Create the JWT token for the user
            res.cookie("access-token", accessToken, { maxAge: 60 * 30 * 1000 }) // This will create cookie in clients browswer(maxAge is expriation time for the cookie)
            res.json({ userData:{username: user.username, email: user.email, isAuthenticated: true}, access_token:accessToken });
        }
    })
});

// validate user by decoding the JWT token
router.get("/authenticate", validateToken, (req, res) => {
    res.json({
        username: req.username,
        email: req.email,
        isAuthenticated: req.authenticated
    })
})


// return all the users
router.get("/", async (req, res) => {
    //get the users from database
    const users = await User.findAll();
    res.send(users)

});

// Handle Delete user
router.delete('/:username', async (req, res) => {
    const username = req.params.username

    try {
        const result = await User.destroy({
            where: {
                username: username
            }
        })

        res.send("users successfully deleted!")
    } catch (e) {
        res.send("cant delete that user!")
    }

})

// Handle storing the player's score
router.post('/store-score', validateToken, async (req, res) => {
    const { score } = req.body;

    try {
        // find player's details
        const user = await User.findOne({ where: { username: req.username } });

        // Update score if  score in the request is higher than the stored score
        if (score > user.highestScore) {
            user.highestScore = score;
            await user.save()
            return res.send("updated score")
        }
        return res.sendStatus(200)

    } catch (e) {
        console.log(e)
        return res.send("can't update score server error!")
    }
})

// Returns all the highest scores of all the players
router.get('/get-scores', async (req, res) => {
    try {
        const result = await User.findAll({
            order: [
                ['highestScore', 'DESC'],
            ],
            attributes: ['username', 'highestScore']
        })

        res.send(result)
    } catch (e) {
        console.log(e)
        res.sendStatus(404).send("internal server error")
    }
})

module.exports = router;