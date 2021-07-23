const express = require('express');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcrypt');
const app = express();

const SERVER_PORT = 4000;

const db = require('./models');

app.use(express.json());
app.use(cors())

db.sequelize.sync().then(() => {
    app.listen(SERVER_PORT, () => {
        console.log('server running...')
    })
})

// app.use(
//     session({
//       key: "user",
//       secret: "event-management",
//       resave: false,
//       saveUninitialized: false,
//       store: new MemoryStore({
//           checkPeriod: 86400000
//       }),
//       cookie: {
//         expires: 60 * 60 * 24,
//         maxAge: 86400000,
//         SameSite: 'Strict'
//       },
//     })
// );

//REGISTRATION
app.post('/userCreate', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const role = req.body.role;
    const isActive = role === "Admin" ? true: false

    try {
        const salt = await bcrypt.genSalt();
        console.log(salt)
        console.log(req.body)
        const hashedPassword = await bcrypt.hash(password, salt)
        await db.User.create({
            username: username,
            password: hashedPassword,
            role: role,
            points: 0,
            isActive: isActive
        })
        res.status(201).send({message: "Successfully registered"})
    } catch (error) {
        res.send({message: "Username already exists"});
        console.log(error)
    }
})

//LOGIN
app.post('/user', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    try {
        const user = await db.User.findAll({
            where: {
              username: username
            }
        });
        if(user && user.length > 0) {
            await bcrypt.compare(password, user[0].get({plain: true}).password, (error, response) => {
                if(response) {
                        db.User.findAll({
                            where: {
                                username: username
                            }
                        }).then(response => {
                            const loggedUser = {
                                id: response[0].id,
                                username: response[0].username,
                                role: response[0].role,
                                points: response[0].points,
                                isActive: response[0].isActive
                            }
                            res.send({message: 'User Authenticated', isLoggedIn: true, user: loggedUser});
                        }).catch(err => console.log(err))

                } else {
                    res.send({ message: "Invalid Password", isLoggedIn: false});
                }
            });
        } else {
            res.send({message: "Invalid Username", isLoggedIn: false});
        }

    } catch (error) {
        res.send({message: "Invalid Username", isLoggedIn: false});
        console.log(error)
    }
   
})

app.get('/users', async (req, res) => {
    try {
        const users = await db.User.findAll({
            include: [
                {
                    model: db.GameweekPrediction,
                    as: 'gameweekPredictions',
                    include: [
                        {
                            model: db.MatchPrediction,
                            as: 'matchPredictions'
                        }
                    ]
                }
            ]
        })
        res.send({users: users})
    } catch (error) {
        console.log(error)
    }
})

app.post('/gameweek', async (req, res) => {
    try {
        const gameweek = await db.GameweekPrediction.findOrCreate({
            where: {
                gameweek: req.body.gameweek,
                seasonId: req.body.seasonId,
                UserId: req.body.UserId
            },
            include: [
                {
                    model: db.MatchPrediction,
                    as: 'matchPredictions',
                }
            ],
            defaults: {
                gameweek: req.body.gameweek,
                seasonId: req.body.seasonId,
                UserId: req.body.UserId
            }
        })
        res.send({gameweek: gameweek})
    } catch (error) {
        console.log(error)
        res.send({message: error})
    }
})

app.post('/prediction', async (req, res) => {
    try {
        const prediction = await db.MatchPrediction.create({
            matchId: req.body.id,
            GameweekPredictionId: req.body.GameweekPredictionId,
            homeSideScore: req.body.prediction.homeTeamScore,
            awaySideScore: req.body.prediction.awayTeamScore,
            isResolved: false,
            isCorrectScore: false,
            isExactScore: false
        })
        res.send({prediction: prediction})
    } catch (error) {
        console.log(error)
        res.send({message: error})
    }
})



//SESSION
app.get('/user', async (req, res) => {
    if(req.session.user) {
        res.send({isLoggedIn: true, user: req.session.user})
    } else {
        res.send({isLoggedIn: false})
    }

})