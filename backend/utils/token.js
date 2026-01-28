const jwt= require('jsonwebtoken')

const signAccessToken= (user)=>
    jwt.sign(
        {id:user._id,username:user.username,email:user.email},
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn:"15m"}
    )

const signRefreshToken=(user)=>
    jwt.sign(
        {id:user._id},process.env.REFRESH_TOKEN_SECRET,{expiresIn:"7d"}
    )

module.exports= {signAccessToken,signRefreshToken}
