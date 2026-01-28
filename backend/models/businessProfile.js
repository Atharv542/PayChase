const mongoose= require('mongoose')
const { applyTimestamps } = require('./user')

const businessProfileSchema= mongoose.Schema(
    {
        ownerId:{
            type:mongoose.Schema.Types.ObjectId,
            required:true,
            ref:"User",
            unique:true,
            index:true
        },
        companyName:{
            type:String,
            required:true,
            trim:true,
        },
        logoUrl:{
            type:String,
            default:null
        },
        phone:{
            type:String,
            default:"",
            trim:true
        },
        email:{
            type:String,
            default:"",
            trim:true
        },
        address:{
            type:String,
            default:"",
            trim:true
        },
        gstin:{
            type:String,
            default:"",
            trim:true
        },
        defaultTerms: { type: String, default: "", trim: true },

    },
    {timetamps:true}
)

module.exports= mongoose.model("BusinessProfile",businessProfileSchema)