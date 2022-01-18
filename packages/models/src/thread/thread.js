'use strict';

const { mongoose } = require('../db'),
  Schema = mongoose.Schema,
  ModelError = require('../modelError');

//   Thread Schema 

const threadSchema = new Schema({
    title: {
        type: String,
        required:true,
        trim: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    date: {
        type: Date, 
        required: true
    },
    comments: {
        type: [String]
    },
    campaign: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Campaign'
    }
})

threadSchema.statics.addThread= function addThread(params){
    this.create(params).then(function (savedThread) {
    console.log(savedThread); 
    return savedThread;
})}


const threadModel = mongoose.model('Thread', threadSchema);


module.exports = {
    schema: threadSchema,
    model: threadModel
}