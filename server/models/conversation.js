const  mongoose = require('mongoose')

const conversationSchema=new mongoose.Schema({
     recipients:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }],
    message:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Message',
        default:[],

    }]
},

{timestamps:true}

);

module.exports=mongoose.model('Conversation',conversationSchema)