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
        const prediction = await db.MatchPrediction.findAll({
            where: {
                matchId: req.body.id,
                GameweekPredictionId: req.body.GameweekPredictionId
            }
        })
        if (prediction.length > 0) {
            res.send({prediction: prediction})
        } else {
            const newPrediction = await db.MatchPrediction.create({
                matchId: req.body.id,
                GameweekPredictionId: req.body.GameweekPredictionId,
                homeTeamName: req.body.homeTeam.name,
                awayTeamName: req.body.awayTeam.name,
                homeTeamScore: req.body.prediction.homeTeamScore,
                awayTeamScore: req.body.prediction.awayTeamScore,
                isResolved: false,
                isCorrectScore: false,
                isExactScore: false,
                isBoosted: req.body.isBoosted
            })
            res.send({prediction: newPrediction})
        }
        

    } catch (error) {
        console.log(error)
        res.send({message: error})
    }
})

app.put('/prediction', async (req, res) => {
    try {
        const predictionToUpdate = await db.MatchPrediction.findOne({
            where: {
                id: req.body.id,
                matchId: req.body.matchId,
                GameweekPredictionId: req.body.GameweekPredictionId,
            }
        })
        console.log(req.body);
        if (predictionToUpdate) {
            const prediction = await predictionToUpdate.update({
                isExactScore: req.body.isExactScore,
                isCorrectScore: req.body.isCorrectScore,
                isResolved: req.body.isResolved,
            })
            res.send({prediction: prediction})
        }
    } catch (error) {
        console.log(error);
    }
})

app.put('/user', async (req, res) => {
    try {
        const userToUpdate = await db.User.findOne({
            where: {
                id: req.body.UserId
            }
        })
        if (userToUpdate) {
            const user = await userToUpdate.update({
                points: userToUpdate.points + req.body.points
            })
            res.send({user: user})
        }

    } catch (error) {
        console.log(error)
    }
})


app.post('/gameweekPredictions', async(req, res) => {
    try {
        const gameweekPredictions = await db.GameweekPrediction.findAll({
            where: {
                gameweek: req.body.gameweek
            },
            include: [
                {
                    model: db.MatchPrediction,
                    as: 'matchPredictions',
                }
            ],
        })
        res.send({gameweekPredictions: gameweekPredictions})
    } catch (error) {
        console.log(error)
    }
})

app.post('/userPredictions', async(req, res) => {
    try {
        const userPredictions = await db.GameweekPrediction.findAll({
            where: {
                UserId: req.body.id
            },
            include: [
                {
                    model: db.MatchPrediction,
                    as: 'matchPredictions'
                }
            ]
        })
        if (userPredictions) { res.send({userPredictions: userPredictions}) }
        else { res.send({userPredictions: null }) }
    } catch (error) {
        console.log(error)
    }
})

app.post('/userGameweek', async(req, res) => {
    try {
        const userGameweek = await db.GameweekPrediction.findOne({
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
        })
        if (userGameweek) { res.send({gameweek: userGameweek}) }
        else { res.send({gameweek: null }) }
    } catch (error) {
        console.log(error)
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