'use strict';

const { mongoose } = require('../db'),
  Schema = mongoose.Schema,
  ModelError = require('../modelError');

const db = mongoose.connection.db.collection('Boxes');  

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

campaignSchema.statics.getBoxes = db.Boxes.find({
    locations: {$geoWithin: {
        type:"Polygon",
        coordinates: 
        [
        [[13.199764430134934,52.747307491826916],
        [12.989438713200741,52.56276787066673],
        [13.182498462722009,52.535922734418875],
        [13.199764430134934,52.747307491826916]]
        ]
    }}
})


// campaignSchema.statics.getBoxes = function getBoxes(opts= {}){
//     const {polygonDraw} = opts,
//     query= {};

//     if(polygonDraw){
//         query['polygonDraw'] = { '$geoWithin': {  '$geoemtry':
//         { type:"Polygon",
//           coordinates:
//             [ 
//                 [[13.167522890113815,52.74105740885352],
//                 [13.017961690117318,52.56276787066673],
//                 [13.272815792481651,52.543560844345166],
//                 [13.167522890113815,52.74105740885352]]
//         ]
//     }                 
// }

//     }
// }
// console.log(query);
// }

//campaignSchema.methods.notifyallusers

const campaignModel = mongoose.model('Campaign', campaignSchema);


module.exports = {
    schema: campaignSchema,
    model: campaignModel
}