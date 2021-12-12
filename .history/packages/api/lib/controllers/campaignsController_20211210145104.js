'use strict';

const { Campaign } = require('@sensebox/opensensemap-api-models');

const { checkContentType } = require('../helpers/apiUtils');
const { retrieveParameters } = require('../helpers/userParamHelpers');
const handleError = require('../helpers/errorHandler');
const { id } = require('apicache');


const postNewCampaign = async function postNewCampaign (req, res, next) {
    try {
      let newCampaign = await Campaign.addCampaign(req._userParams);
      res.send(201, { message: 'Campaign successfully created', data: newCampaign });
            
    } catch (err) {
      handleError(err, next);
    }
  };

///////////// CRUD FUNCTIONS //////////////////

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
    stream = await Campaign.find();
    res.send(200, { code: 'Ok', data: { stream } });
    
  }catch (err) {
      handleError(err, next);
  }}
  /**
   *@api {get} /campaigns/:campaignId Get a specific campaign
   *@apiDescription With this endpoint you can search for a campaign by id
   *@apiName getCampaign
   *@apiGroup Campaigns 
   *@apiSuccessExample Example data on success: 
   *{
    "title": "examplecampaign",
    "owner": "exampleowner",
    "aboutMe": "example",
    "campaignGoals": "examplegoals",
    "campaignDetails": "exampledetails",
    "phenomena": "PM10"
   *}
   */
    
  const getCampaign = async function getCampaign (req, res, next){
    const campaignId  = req._userParams;
    res.send(campaignId);
    // content-type is always application/json for this route
    /*
    res.header('Content-Type', 'application/json; charset=utf-8');
    
    const { campaignId } = req._userParams;

    try{
      const campaign = await Campaign.findCampaignbyId(campaignId); 
      res.send(campaign)  
    } catch (err) {
    handleError(err, next);
    }
  };
  */
   
 /**
 * @api {put} /campaigns/:campaignId Update a campaign
 * @apiDescription Modify the properties of a campaign. Almost every aspect of a campaign can be modified through this endpoint.
 * @apiParam (RequestBody) {String} [title] the title of this campaign.
 * @apiParam (RequestBody) {String} [aboutMe] 
 * @apiParam (RequestBody) {String} [campaignGoals] goals of this campaign
 * @apiParam (RequestBody) {String} [campaignDetails] 
 * @apiParam (RequestBody) {String} [phenomena] the phenomena that are measured in this campaign 
 * @apiParamExample {json} Request-Example: 
 * {
 * "_id": "56e741ff933e450c0fe2f705",
 *  "title": "my campaign",
 *  "aboutMe": "this is the aboutMe",
 *  "campaignGoals": "these are the campaignGoals",
 *  "campaignDetails": "some details",
 *  "phenomena": "Wind Speed"
 * }
 
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


  /**
 * @api {delete} /campaigns/:campaignId Mark a campaign for deletion
 * @apiDescription This will delete a campaign. Please note that the deletion isn't happening immediately.
 * @apiName deleteCampaign
 * @apiGroup Campaigns
 */
/**
  const deleteCampaign = async function deleteCampaign (req, res, next){
    const { campaignId } = req._userParams; 

    try {
      const user = await User.findOwnerofCampaign(campaignId);
      await user.removeCampaign(campaignId);
      clearCache(['getCampaigns']);
      postToSlack(`Management Action: Campaign deleted: ${req.user.name}(${req.user.email}) just deleted ${campaignId.join(',')}`);
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
       getCampaigns 
      ],
      getCampaign: [
        getCampaign
      ]
      
  }
  