'use strict';

const { Campaign } = require('../..');

const { mongoose } = require('../db'),
  Schema = mongoose.Schema,
  ModelError = require('../modelError');

//   Campaign Schema 

const campaignSchema = new Schema({
    title: {
        type: String,
        required:true,
        trim: true
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
        type: String,
        trim: true,
        required: true,
        enum: ['PM10', 'Wind speed']
    }  

})

campaignSchema.statics.addCampaign= function addCampaign(params){
     this.create(params).then(function (savedCampaign) {
      
     console.log(savedCampaign); 
     return savedCampaign;
})}

campaignSchema.statics.findCampaignById = function findCampaignById(params){
    this.findById(id = params.id).then(function(foundCampaign){
    
    console.log(foundCampaign);
    return foundCampaign;
    })
}
//campaignSchema.methods.notifyallusers

const campaignModel = mongoose.model('Campaign', campaignSchema);


module.exports = {
    schema: campaignSchema,
    model: campaignModel
}