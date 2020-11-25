const { authenticate } = require('passport');

const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt');

async function inicialize(passport, getUserByEmail, getUserById) {
        const authenticateUser = async (email, password, done) => {
            const user = getUserByEmail(email)
            if (user == null){
                return done(null, false, { message: 'Não há usuario com esse email!'})
            }

            try {
                if (await bcrypt.compare(password, user.password)) {
                    return done(null, user)
                } else {
                    return done(null, false, { message: 'Senha incorreta!'})
                }
            } catch (e) {
                return done(e)
            }
        }

        passport.use(new LocalStrategy({ usernameField: 'email'}, authenticateUser))
        passport.serializeUser((user, done) => done(null, user.id))
        passport.deserializeUser((id, done) => {
            return done(null, getUserById(id).id)
        })

}

module.exports = inicialize