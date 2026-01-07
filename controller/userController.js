const Users = require('../model/usermodel')
const jwt = require('jsonwebtoken')
const stripe = require('stripe')(process.env.stripeKey);
const mongoose = require("mongoose");

// register
exports.registercountroller = async (req, res) => {
    const { username, email, password } = req.body
    console.log(username, email, password);

    try {
        const existinguser = await Users.findOne({ email })
        if (existinguser) {
            return res.status(400).json({ message: "Already exsting user" })
        } else {
            const newUser = new Users({
                username, password, email
            })
            await newUser.save()
            res.status(200).json(newUser)

        }

    } catch (err) {
        return res.status(500).json(err)

    }



}
// login
exports.logincontroller = async (req, res) => {
    const { email, password } = req.body
    console.log(email, password);

    try {
        const existinguser = await Users.findOne({ email })
        if (existinguser) {
            if (existinguser.password === password) {
                const token = jwt.sign({ userMail: existinguser.email, isPremium: existinguser.isPremium, userId: existinguser._id, },process.env.sk)
                res.status(200).json({ existinguser, token })
            }else{
                res.status(400).json("password do not match")
            }


        } else{
            res.status(400).json("user does not extisting")

        }
    }catch(err){
        res.status(500).json(err)
    }
    
}
// google login
exports.googlelogin=async(req,res)=>{
    const {username,password,email,photo}=req.body
    console.log(username,password,email,photo);

    try{
        const existinguser= await Users.findOne({email})
        if(existinguser){
            const token= jwt.sign({userMail:existinguser.email},process.env.sk)
            res.status(200).json({existinguser,token})
        }else{
            const newUser= new Users({
                username,password,email,profile:photo
            })
            await newUser.save()
            const token= jwt.sign({userMail:existinguser.email},process.env.sk)
            res.status(200).json({existinguser:newUser,token})
        }
    }catch(err){
        res.status(500).json(err)
    }
    
}
// edit the user profile
exports.editUserProfile= async (req, res) => {
    
    // logic
    const{username,password,profile,bio}=req.body
    const prof=req.file?req.file.filename:profile
    console.log(prof);
    
    const email = req.payload
    console.log(email);
    
    // errr handling
    try {

        const userProfile = await Users.findOneAndUpdate({email},{username,email,password,profile:prof,bio},{new:true})
        res.status(200).json(userProfile)

    } catch (err) {
        res.status(500).json(err)

    }

}


// buy premiem
exports.makePremiumPaymentController = async (req, res) => {
    const email = req.payload.userMail

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            customer_email: email,       // 🔑 Track user
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: "Premium Membership",
                            description: "Access premium features"
                        },
                        unit_amount: 100  // $1.00 for testing
                    },
                    quantity: 1
                }
            ],
            success_url: "http://localhost:5173/paymentsucess",
            cancel_url: "http://localhost:5173/paymentfail"
        })

        res.status(200).json({ url: session.url })
    } catch (err) {
        res.status(500).json(err)
    }
}

// active premiem
exports.activatePremiumController = async (req, res) => {
    const email = req.payload.userMail

    try {
        await Users.updateOne(
            { email },
            { $set: { isPremium: true } }
        )
        res.status(200).json("Premium Activated")
    } catch (err) {
        res.status(500).json(err)
    }
}

exports.followUser = async (req, res) => {
  try {
    const { userMail } = req.payload;
    const { userId } = req.params;

    const currentUser = await Users.findOne({ email: userMail });
    if (!currentUser)
      return res.status(404).json({ message: "Current user not found" });

    if (currentUser._id.toString() === userId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const targetUser = await Users.findById(userId);
    if (!targetUser)
      return res.status(404).json({ message: "Target user not found" });

    const isFollowing = currentUser.following.some(
      id => id.toString() === userId
    );

    if (isFollowing) {
      // ✅ UNFOLLOW (ObjectId safe)
      await Users.updateOne(
        { _id: currentUser._id },
        { $pull: { following: new mongoose.Types.ObjectId(userId) } }
      );

      await Users.updateOne(
        { _id: targetUser._id },
        { $pull: { followers: currentUser._id } }
      );

    } else {
      // ✅ FOLLOW (ObjectId safe)
      await Users.updateOne(
        { _id: currentUser._id },
        { $addToSet: { following: new mongoose.Types.ObjectId(userId) } }
      );

      await Users.updateOne(
        { _id: targetUser._id },
        { $addToSet: { followers: currentUser._id } }
      );
    }

    const updatedCurrentUser = await Users.findById(currentUser._id);
    const updatedTarget = await Users.findById(userId);

    return res.status(200).json({
      message: isFollowing ? "User unfollowed" : "User followed",
      followed: !isFollowing,
      following: updatedCurrentUser.following,
      followingCount: updatedCurrentUser.following.length,
      followersCount: updatedTarget.followers.length
    });

  } catch (err) {
    console.error("Follow error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
    
  }
};

// Search users by username or email (exclude current user)
exports.searchUsers = async (req, res) => {
  try {
    const q = req.query.q || "";
    const userMail = req.payload.userMail;
    const currentUser = await Users.findOne({ email: userMail });

    const regex = new RegExp(q, 'i');
    const filter = q ? { $or: [{ username: regex }, { email: regex }] } : {};
    if (currentUser) filter._id = { $ne: currentUser._id };

    const users = await Users.find(filter).select('username email profile').limit(20);
    res.status(200).json(users);
  } catch (err) {
    console.error('Search users error:', err);
    res.status(500).json({ error: err.message });
  }
};


