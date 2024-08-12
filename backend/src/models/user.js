import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import envValues from '../config/serverConfig.js';
const { SECRETORKEY } = envValues;

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    name: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 50
    },
    password: {
        type: String,
        required: true,
        minLength: 6,
        maxLength: 30
    }
});

userSchema.pre('save', function(next) {
    const user = this;
    const salt = bcrypt.genSaltSync(10);
    const encryptedPassword = bcrypt.hashSync(user.password, salt);
    user.password = encryptedPassword;
    next();
});

userSchema.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.password);
}

userSchema.methods.genJwt = () => {
    return jwt.sign({id: this.id, email: this.email}, SECRETORKEY, {expiresIn: '1m'});
}

const User = mongoose.model('User', userSchema);

export default User;