'use strict';

const Campaign = require('../../../models/src/campaign/campaign');
const { checkContentType } = require('../helpers/apiUtils');
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

    
      ]
  }