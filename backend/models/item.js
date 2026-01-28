const mongoose= require('mongoose')

const itemSchema= mongoose.Schema(
{
    ownerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        index:true
    },
    name:{
        type:String,
        required:true,
        trim:true
    },
    unit:{
        type:String,
        required:true,
        trim:true
    },
    rate:{
        type:Number,
        required:true,
        min:0
    },
    taxPercent:{
        type:Number,
        required:true,
        min:0,
        max:100,
        default:0
    },
},
{timestamps:true}
)

module.exports= mongoose.model("Item",itemSchema)