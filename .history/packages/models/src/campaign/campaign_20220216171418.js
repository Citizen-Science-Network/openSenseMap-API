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



campaignSchema.statics.getBoxesWithin = function getBoxesWithin(params) {

          
    var polygon = Promise.resolve(this.create(params).then(function(saved){
        console.log('SAVED '+ saved);
         let poly = JSON.parse(saved.polygonDraw);
         console.log('POLY '+ poly);
         return poly;
     }));

     const returnPolygon = async () => {
         const pol = await polygon;
         console.log('RETURN POLYGON' + pol);
         console.log(typeof(pol));
         return pol;
     }

     var coords = returnPolygon();

     console.log(await coords);
     
    //  polygon.then(function(value){
    //       console.log('PARSED JSON ' + JSON.parse(value.polygonDraw));
    //  })

    
    // this.create(params).then(function (savedCampaign){
    //      console.log('SAVED CAMPAIGN POLYGON '+ savedCampaign.polygonDraw);
    //      console.log('PARSED' + JSON.parse(savedCampaign.polygonDraw));
    //      let parsedPolygon = JSON.parse(savedCampaign.polygonDraw);
    //      return parsedPolygon;})

        
    
      return Box.find({
          locations: {
            $geoWithin: {
                $geometry: {
                    type:"Polygon",
                    coordinates: [ 
                                      [[13.167522890113815,52.74105740885352],
                                      [13.017961690117318,52.56276787066673],
                                      [13.272815792481651,52.543560844345166],
                                      [13.167522890113815,52.74105740885352]]
                              ]
                }
            }
        }
    })
//})
    
    //return Box.find({_id: '5a914cfabc2d410019af5758'})
    //  query['polygonDraw'] = { '$geoWithin': {  '$geometry':
    //      { type:"Polygon",
    //        coordinates:
    //          [ 
    //              [[13.167522890113815,52.74105740885352],
    //              [13.017961690117318,52.56276787066673],
    //              [13.272815792481651,52.543560844345166],
    //              [13.167522890113815,52.74105740885352]]
    //      ]
    //  }}}
    // console.log(query);
    // return query;
 }
 

//campaignSchema.methods.notifyallusers

const campaignModel = mongoose.model('Campaign', campaignSchema);


module.exports = {
    schema: campaignSchema,
    model: campaignModel
}