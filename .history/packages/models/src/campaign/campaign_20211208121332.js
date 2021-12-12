'use strict';

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
      // request is valid
      // persist the saved box in the user
     console.log(savedCampaign); 
     return savedCampaign;
})}

////////////////NEW FUNCITIONS //////////////////

// return campaigns that match the title parameter
campaignSchema.statics.findCampaings = function findCampaigns(title){
  const filter = {
      title: { '$regex': title, '$options': 'i'}
  };

  const projection = {
      _id: 1,
      title: 1,
      owner: 1,
      aboutMe: 0,
      campaignGoals: 0,
      campaignDetails: 0,
      phenomena: 0,
      startDate: 1,
      endDate: 1 
  };

  return Promise.resolve(this.find(filter, projection));
};
//campaignSchema.methods.notifyallusers

/////////////////////////////////////////////////

const campaignModel = mongoose.model('Campaign', campaignSchema);


module.exports = {
    schema: campaignSchema,
    model: campaignModel
}