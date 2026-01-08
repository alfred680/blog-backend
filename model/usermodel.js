const mongouse = require("mongoose")



// create schema

const userSchema = new mongouse.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    profile: {
        type: String

    },
    bio: {
        type: String,
        default: "user"
    },
    isPremium: {
        type: Boolean,
        default: false
    },
    followers: [
        { type: mongouse.Schema.Types.ObjectId, ref: "users" }
    ],
    following: [
        { type: mongouse.Schema.Types.ObjectId, ref: "users" }
    ],
    resetPasswordToken: String,
    resetPasswordExpire: Date
},
    { timestamps: true }
);

const Users = mongouse.model("users", userSchema)
module.exports = Users