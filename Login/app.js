if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const passport = require('passport');
const bodyParser = require('body-parser')
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');

const inicializePassport = require('./passport-config');
inicializePassport(
    passport, 
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id) 
)

const users = []

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/', checkAuth, (req, res) => {
    res.render('index', { name: req.user.name})
})

app.get('/login', checkNotAuth, (req, res) => {
    res.render('login')
})

app.post('/login', checkNotAuth, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/cadastro', checkNotAuth, (req, res) => {
    res.render('cadastro')
})

app.post('/cadastro', checkNotAuth, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('/login')
    } catch {
        res.redirect('/cadastro')
    }
})

app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})

function checkAuth(req, res, next) {
    if (req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}

function checkNotAuth(req, res, next) {
    if (req.isAuthenticated()){
        return res.redirect('/')
    }
    next()
}

const PORT = 80//process.env.PORT || 3000

app.listen(PORT,
    console.log(`Servidor rodando: http://localhost:${PORT}`)
);