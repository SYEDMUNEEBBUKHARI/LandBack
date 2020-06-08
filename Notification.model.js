const mongoose=require("mongoose");
const Schema = mongoose.Schema;


let Notification= new Schema({

FromUser:{
type: String,
required: true,

}
,
ToUser:{
    type: String
    ,required: true,
   
    
},

LandId:{

    type: String,
   required: true
    
},
date: {
type: Date,
default: Date.now

}



});

module.exports= mongoose.model('Notification', Notification);