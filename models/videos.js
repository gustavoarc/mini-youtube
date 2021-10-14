const { Schema, model } = require('mongoose');

const VideosSchema = Schema({
    title: {
        type: String,
        required: [true, 'The title is necessary'],
        unique: true
    },
    description: {
        type: String,
        required: [true, 'The description is necessary'],
        unique: true
    },
    tags: {
        type: String,
        required: [true, 'The tags is necessary'],
        unique: true
    },
    videoUrl: {
        type: String,
        unique: true
    },
    public_id: {
        type: String
    },
    loadingDate: {
        type: Date
    },
    iLike: {
        type: Number
        
    },
    notLike: {
        type: Number 
    },
     
});


VideosSchema.methods.toJSON = function() {
    const { __v, estado, ...data  } = this.toObject();
    return data;
}


module.exports = model( 'Videos', VideosSchema );
