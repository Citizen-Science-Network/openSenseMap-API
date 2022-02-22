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

campaignSchema.statics.getBoxes = function getBoxes(opts= {}){
    const {polygonDraw} = opts,
    query= {};

    if(polygonDraw){
        query['polygonDraw'] = { '$geoWithin': {  $polygon:
            [ 
                [ 7.609723909072017, 51.964860054126234], 
                [7.610432865503185, 51.96324235718944], 
                [ 7.607901326883251, 51.963361400559506], 
                [ 7.608403938203196, 51.96423080547393], 
                [ 7.609723909072017, 51.964860054126234]
        ]                 
}

    }
}
console.log(query);
}

//campaignSchema.methods.notifyallusers

const campaignModel = mongoose.model('Campaign', campaignSchema);


module.exports = {
    schema: campaignSchema,
    model: campaignModel
}