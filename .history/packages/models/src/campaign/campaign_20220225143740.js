'use strict';



const { mongoose } = require('../db'),
  Schema = mongoose.Schema,
  got = require('got'),
  {model: Box} = require('../box/box'),
  {model: User} = require('../user/user'),
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
      var box_ids = []
      for(let i =0; i<boxes.length; i++){
          var boxID = boxes[i]._id;
          box_ids.push(boxID);
      }

      let users = await User.find({boxes: {$in: box_ids} });
      //console.log('USERS' + users + 'EMAIL' + users[0].email);
      var usermails = []
      for(let i=0; i<users.length; i++){
        var usermail = users[i].email;
        usermails.push(usermail);  
      }
      console.log('USERMAILS '+ usermails);

    const response = await got.post('https://slack.com/api/conversations.create?name=testfeb26&is_private=false&pretty=1', {
	    json: [
            {
              name: 'testFeb26'
            }
          ],
          responseType: "json",
          headers: {
            "Authorization": "Bearer xoxp-2966864970930-2969169630004-3133437066116-e1d01bd7f41b169d33b63a7485b6755b"
          }
    })

    console.log(response);   
      
      return box_ids;

    ;}

// campaignSchema.statics.getPolygonUsers = async function getPolygonUsers(){
//     let users = await User.find();
//     return users;
// }



        
    

//campaignSchema.methods.notifyallusers

const campaignModel = mongoose.model('Campaign', campaignSchema);


module.exports = {
    schema: campaignSchema,
    model: campaignModel
}