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

const addIndex = async (fields, options) => {
    const indexExists = await Peak.collection.indexExists(options.name);
    if (!indexExists) {
        const indexFields = fields.reduce((acc, field) => {
            acc[field] = 1;
            return acc;
        }, {});
        peakSchema.index(indexFields, options);
        await Peak.createIndexes();
    }
};


if(process.env.NODE_ENV !== 'production') {
    addIndex(['lat', 'lon'], { name: 'latLonIndex' });
    addIndex(['tags.name'], { name: 'peaksNameIndex' });
}

export default Peak;
