'use strict';

const { Thread } = require('@sensebox/opensensemap-api-models');

const { checkContentType } = require('../helpers/apiUtils');
const { retrieveParameters } = require('../helpers/userParamHelpers');
const handleError = require('../helpers/errorHandler');
const { id } = require('apicache');



const postNewThread = async function postNewThread (req, res, next) {
    try {
      let newThread = await Thread.addThread(req._userParams);
      
      res.send(201, { message: 'Thread successfully created', data: newThread });
            
    } catch (err) {
      handleError(err, next);
    }
  };

///////////// CRUD FUNCTIONS //////////////////

  /**
 * @api {get} /threads Get all Threads
 * @apiDescription With this endpoint all threads get listed
 * @apiName getThreads
 */

  const getThreads = async function getThreads (req, res, next){
    // content-type is always application/json for this route
  res.header('Content-Type', 'application/json; charset=utf-8');
  
  try{
    let stream; 
    stream = await Thread.find();
    res.send(200, { code: 'Ok', data: { stream } });
    
  }catch (err) {
      handleError(err, next);
  }}
  /**
   *@api {get} /threads/:threadId Get a specific thread
   *@apiDescription With this endpoint you can search for a thread by id
   *@apiName getThread
   */
    
   const getThread = async function getThread(req, res, next) {
    try {
      let thread = await Thread.findById(req._userParams.threadId).exec();
      //let campaign = await Campaign.findById(req._userParams.campaignId).exec();
      res.send(201, { message: 'Thread successfully retrieved', data: thread });
  
    } catch (err) {
      handleError(err, next);
    }}
    
   
 /**
 * @api {put} /threads/:threadId Update a thread
 * @apiDescription Modify the properties of a thread.
 */
 const updateThread = async function updateThread (req, res, next){
    try {
      console.log(req._userParams);
      let thread = await Thread.findOneAndUpdate({ _id: req._userParams.threadId}, req._userParams).exec();
    
      // update other properties
        
      res.send({ code: 'Ok', data: thread });
      //clearCache(['getCampaigns']);
    } catch(err){
      handleError(err, next);
    }
  }


  /**
 * @api {delete} /threads/:threadId Mark a thread for deletion
 * @apiDescription This will delete a thread. Please note that the deletion isn't happening immediately.
 * @apiName deleteThread
 */

   const deleteThread = async function deleteThread(req, res, next) {


    try {
  
      let deletedThread = await Thread.remove({ _id: req._userParams.threadId }).exec();
  
      res.send({code: 'Ok', msg: 'Thread deleted'});
    } catch (err) {
      handleError(err, next);
    }
  
  }


  module.exports = {
      postNewThread: [
          checkContentType,
          retrieveParameters([
              { name: 'title', dataType: 'String' },
              { name: 'owner', dataType: 'String' },
              { name: 'date', dataType: 'Date'},
              { name: 'comments', dataType: 'String'},
              { name: 'campaign', dataType: 'String' }              
          ]),
          postNewThread

    
      ],
      getThreads: [
       getThreads 
      ],
      getThread: [
        retrieveParameters([
          { name: 'threadId', required: true }
        ]),
        getThread
      ],
      updateThread: [
        checkContentType,
        retrieveParameters([
          {name: 'threadId', required:true},
          {name: 'title', required: true, dataType: 'String'},
          {name: 'owner', dataType: 'String'},
          {name: 'date' ,required: true, dataType: 'String'},
          {name: 'comments', dataType: ['String']},
          {name: 'campaign' ,required: true, dataType: 'String'}
          

        ]),
        updateThread
      ],
      deleteThread: [
        retrieveParameters([
          {name: 'threadId', required: true}
        ]),
        deleteThread
      ]
      
  }
  
