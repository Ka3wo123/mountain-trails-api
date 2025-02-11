import mongoose from 'mongoose';

const peakSchema = new mongoose.Schema({
    type: { type: String, required: true },
    id: { type: Number, required: true },
    lat: { type: Number, required: true },
    lon: { type: Number, required: true },
    tags: {
        name: { type: String, required: true },
        natural: { type: String, required: true },
        ele: { type: String },
        source: { type: String },
        wikidata: { type: String },
        wikipedia: { type: String },
    }
}, {
    timestamps: true
});


const Peak = mongoose.model('Peak', peakSchema);

export default Peak;
