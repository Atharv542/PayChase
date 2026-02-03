const express= require('express')
const Item= require('../models/item')
const requireAuth= require('../middlewares/requireAuth')

const router= express.Router()

//Create item

router.post('/',requireAuth,async(req,res)=>{
     try{ 
        const {name,unit,rate,taxPercent} = req.body;
        if(!name || rate===undefined) {
            return req.status(400).json({message:"Name and rate are required"})
        }
        const item= await Item.create({
           ownerId: req.user.id,
           name,
           unit,
           rate,
           taxPercent
        })
        res.status(201).json({item})
     }catch(err){
        res.status(500).json({error:err.message})
     }
})



router.get('/',requireAuth,async(req,res)=>{
    try{
       const items= await Item.find({ownerId:req.user.id}).sort({createdAt:-1})
        res.json({items})
    }catch(err){
        res.status(500).json({error:err.message})
    }
    
})

//show single item

router.get('/:id',requireAuth,async (req,res)=>{
    try{
       const item= await Item.findOne({_id:req.params.id,ownerId:req.user.id})
       if(!item){
        res.status(404).json({error:"Item not found"})
       }
       res.json({item})
    }catch(err){
        res.status(500).json({error:err.message})
    }
})

// update item

router.put('/:id',requireAuth,async(req,res)=>{
    try{
       const allowed=["name","unit","rate","taxPercent"]
       const updates={};
       for(const key of allowed){
        if(allowed[key]!==undefined){
            updates[key]= req.body[key]
        }
       }
       const item= await Item.findByIdAndUpdate({_id:req.params.id,ownerId:req.user.id},updates,{new:true,runValidators:true})

       if(!item) return res.status(400).json({message:"Item not found"})
       res.json({item})
    }catch(err){
        return res.status(500).json({error:err.message})
    }
})

//delete item 

router.delete('/:id',requireAuth,async(req,res)=>{
    try{
       const item = await findByIdAndDelete({_id:req.params.id,ownerId:req.user.id})
       if(!item) return res.status(400).json({message:"Item not found"})
       res.json({message:"Item deleted"})
    }catch(err){
        return res.status(500).json({error:err.message})
    }
})

module.exports= router