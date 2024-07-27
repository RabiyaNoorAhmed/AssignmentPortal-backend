const { Schema, model } = require('mongoose');


const noteSchema = new Schema({
    title:
    {
        type: String,
        required: true
    },
    date: {
        type: Date
        , required: true
    },
    content: {
        type: String,
        required: true
    },
    link: {
        type: String
    },
    file: {
        type: String
    },
    course: {
        type: String,
        required: true
    },
    batch: {
        type: String,
        required: true
    }
});

module.exports = model('Notes', noteSchema);

