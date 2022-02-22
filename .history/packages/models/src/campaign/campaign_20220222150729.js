'use strict';


const { mongoose } = require('../db'),
  Schema = mongoose.Schema,
  {model: Box} = require('../box/box'),
  ModelError = require('../modelError');


//   Campaign Schema 

const campaignSchema = new Schema({
    title: {
        type: String,
        required:true,
        trim: true
    },
    polygonDraw: {
        type: String, 
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    aboutMe: {
        type: String, 
        required: true,
        trim: true
    },
    campaignGoals: {
        type: String,
        required: true,
        trim: true
    },
    campaignDetails: {
        type: String,
        required: true,
        trim: true
    },
    startDate: {
        type: Date, 
        required: true
    },
    endDate: {
        type: Date
    },
    phenomena: {
        type: [String],
        trim: true,
        required: true        
    }  

})

campaignSchema.statics.addCampaign= function addCampaign(params){
     this.create(params).then(function (savedCampaign) {
      // request is valid
      // persist the saved box in the user
     console.log(savedCampaign); 
     return savedCampaign;
})}



campaignSchema.statics.getBoxesWithin = async function getBoxesWithin(params) {
        
        let campaign = await this.create(params);
        let poly = JSON.parse(campaign.polygonDraw);
               
        let boxes = await Box.find({
            locations: {
              $geoWithin: {
                  $geometry: {
                      type:"Polygon",
                      coordinates: poly
                  }
              }
          }
      })
      return boxes;

    ;}   
 

//campaignSchema.methods.notifyallusers

const campaignModel = mongoose.model('Campaign', campaignSchema);


module.exports = {
    schema: campaignSchema,
    model: campaignModel
}