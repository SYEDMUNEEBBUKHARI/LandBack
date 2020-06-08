const mongoose=require("mongoose");
const Schema = mongoose.Schema;


let Register= new Schema({

Name:{
type: String,
required: true,
min: 6,
max:255
}
,
Email:{
    type: String
    ,required: true,
    min: 6,
    max:255
    
},
password:{
    type: String,
    min: 8,
    max:1024
    

},
City:{

    type: String,
    min: 8,
    max:255
    
},
Country:{

    type: String,
    min: 8,
    max:255

},
Address:{

    type: String,min: 8,
    max:1024
    
    

},
ipfsHash:{

    type: String
    
    
},
date: {
type: Date,
default: Date.now

}



});

module.exports= mongoose.model('Register', Register);