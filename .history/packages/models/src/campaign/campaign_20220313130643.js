'use strict';



const { mongoose } = require('../db'),
  Schema = mongoose.Schema,
  got = require('got'),
  nodemailer = require('nodemailer'),
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
        let campaigntitle = campaign.title;
               
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

      let mailTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'jmartin.unal@gmail.com',
            pass: 'giirsqaxwqhjxqok'
        }
       });
    
    let mailDetails = {
        from: 'dsmecuador2021@gmail.com',
        to: 'j_raab02@uni-muenster.de',
        subject: 'Campaign Opensensemap',
        text: 'Hello, Javier wants you to join a new campaign;) ',
        html: '<b>Clic here to join it! </b><br> Opensensemap link: <a href="https://join.slack.com/t/opensensemapcampaigns/shared_invite/zt-11uz1lkc3-w98lYPWGllA1iZdMVZFNzQ">link text</a>'
    };
    
    mailTransporter.sendMail(mailDetails, function(err, data) {
        if(err) {
            console.log('Error Occurs');
        } else {
            console.log('Email sent successfully');
        }
    });
    

      const slackBody = await got
      .post(`https://slack.com/api/conversations.create?name=${campaigntitle}&is_private=false&pretty=1`, {
        // json: {
        //     "name": ${campaigntitle},
        //     "is_private": "false",
        //     "pretty": "1"
        //   },
        headers: {
            'Authorization': 'Bearer xoxp-2966864970930-2969169630004-3225607687158-277f4e9600dd7952efc1c180649ef306'
        }  
      });

      console.log(slackBody);
      
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