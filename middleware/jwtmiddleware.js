const jwt=require('jsonwebtoken')

const jwtmiddleware = (req, res, next) => {

    console.log("inside jwtmiddleware");

    const authHeader = req.headers && req.headers.authorization

    if (!authHeader) {
        console.warn("Missing Authorization header in request")
        return res.status(401).json({ error: "Authorization header missing" })
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({ error: "Invalid Authorization format" })
    }

    const token = parts[1]
    console.log(token);
    
    try {
        const jwtResponse = jwt.verify(token, process.env.sk)
        console.log(jwtResponse)


       req.payload ={
            userMail: jwtResponse.userMail,
             isPremium: jwtResponse.isPremium
       }

        
        
        return next()


    } catch (err) {
        console.error("JWT verification failed:", err.message)
        return res.status(401).json({ error: "Invalid or expired token" })
    }

}

module.exports=jwtmiddleware
