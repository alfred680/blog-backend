const Users = require('../model/usermodel')
const jwt = require('jsonwebtoken')
const stripe = require('stripe')(process.env.stripeKey);

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
                const token = jwt.sign({ userMail: existinguser.email, isPremium: existinguser.isPremium },process.env.sk)
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
