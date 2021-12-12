'use strict';

const Campaign = require('../../../models/src/campaign/campaign');
const { checkContentType, postToSlack, clearCache } = require('../helpers/apiUtils');
const { retrieveParameters } = require('../helpers/userParamHelpers');
const handleError = require('../helpers/errorHandler')


const postNewCampaign = async function postNewCampaign (req, res, next) {
    try {
      let newCampaign = await Campaign.addCampaign(req._userParams);
      res.send(201, { message: 'Campaign successfully created', data: newCampaign });
            
    } catch (err) {
      handleError(err, next);
    }
  };

  ///////////// NEW FUNCTIONS //////////////////

  /**
 * @api {get} /campaigns Get all Campaigns
 * @apiDescription With this endpoint all campaigns get listed
 * @apiName getCampaigns
 * @apiGroup Campaigns
 * @apiParam {String} [title] Search string to find campaigns by title, if specified all other parameters are ignored.
 * @apiParam {String} [owner]
 * @apiParam {String} [aboutMe]
 * @apiParam {String} [campaignGoals]
 * @apiParam {String} [campaignDetails] 
 * @apiParam {RFC3339Date} [startdate] RFC 3339 timestamps at which campagin begin. Use in combination with `end date`.
 * @apiParam {RFC3339Date} [enddate] RFC 3339 timestamps at which campagins end. Use in combination with `start date`.
 * @apiParam {String} [phenomenon] A sensor phenomenon (determined by sensor name) such as temperature, humidity or UV intensity. 
 * @apiParam {String=json,geojson} [format=json] the format the sensor data is returned in.
 * @apiSampleRequest https://api.opensensemap.org/campaigns
 * @apiSampleRequest https://api.opensensemap.org/campaigns?title=testcampaign
 */
  const getCampaigns = async function getCampaigns (req, res, next){
    // content-type is always application/json for this route
  res.header('Content-Type', 'application/json; charset=utf-8');
  
  try{
    let stream; 
    if(req._userParams.title){
      stream = await Campaign.findCampaigns(req._userParams);
    }  
  } catch (err) {
    handleError(err, next);
  }
  };

  /** 
  const updateCampaign = async function updateCampaign (req, res, next){
    try {
      const {owner, campaignId} = req._userParams;
      // update owner
      if (owner){
        await Campaign.transferOwnershipOfCampaign(owner, campaignId);
      }
      // update other properties
      let campaign = await Campaign.findCampaignbyId(campaignId);
      await campaign.updateCampaign(req._userParams);

      //post to slack

      postToSlack(`Management Action: Campaign updated: ${req._user.name} (${req.user.email}) just updated "${campaign.title}": <https://opensensemap.org/explore/${box._id}|link>`);
      res.send({ code: 'Ok', data: campaign });
      clearCache(['getCampaigns']);
    } catch(err){
      handleError(err, next);
    }
  }

  const deleteCampaign = async function deleteCampaign (req, res, next){
    const { campaignId } = req._userParams; 

    try {
      const user = await User.findOwnerofCampaign(campaignId);
      await user.removeCampaign(campaignId);
      clearCache(['getCampaigns']);
      postToSlack(`Management Action: Campaign deleted: ${req.user.name}(${req.user.email}) just deleted ${campaignId.join(',')}`);
    }
    res.send({ campaignId});
  } catch(err){
    handleError(err, next);
  }
};
  */

  module.exports = {
      postNewCampaign: [
          checkContentType,
          retrieveParameters([
              { name: 'title', dataType: 'String' },
              { name: 'owner', dataType: 'String' },
              { name: 'aboutMe', dataType: 'String'},
              { name: 'campaignGoals', dataType: 'String'},
              { name: 'campaignDetails', dataType: 'String' },
              { name: 'startDate', dataType: ['RFC 3339']},
              { name: 'endDate', dataType: ['RFC 3339']},
              { name: 'phenomena', dataType: 'String' }
              
          ]),
          postNewCampaign

    
      ],
      getCampaigns: [
        retrieveParameters([
          { name: 'title', dataType: 'String' },
          { name: 'owner', dataType: 'String' },
          { name: 'aboutMe', dataType: 'String'},
          { name: 'campaignGoals', dataType: 'String'},
          { name: 'campaignDetails', dataType: 'String' },
          { name: 'startDate', dataType: ['RFC 3339']},
          { name: 'endDate', dataType: ['RFC 3339']},
          { name: 'phenomena', dataType: 'String' }
        ]),
        getCampaigns
      ]
  }