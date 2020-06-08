const jwt= require('jsonwebtoken');

function auth(req,res,next)
{
    const token = req.header('auth-token');
    if(!token) return res.status(401).send('Access denied');

    try{

        const verified=jwt.verify(token, process.env.Token_Secret);
        req.email=verified;
    }
    catch(err){
        res.status(400).send("Invalid Token");
    }


}