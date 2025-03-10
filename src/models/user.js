import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const ROUNDS = 10;

const peakToSave = new mongoose.Schema(
  {
    peakId: { type: mongoose.Schema.Types.ObjectId, ref: 'Peak' },
    imgData: [
      {
        url: { type: String },
        publicId: { type: String },
      },
    ],
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    surname: { type: String, required: true },
    nick: { type: String, required: true },
    password: { type: String, required: true },
    peaksAchieved: [peakToSave],
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

const addIndex = async (fields, options) => {
  const indexExists = await User.collection.indexExists(options.name);
  if (!indexExists) {
    const indexFields = fields.reduce((acc, field) => {
      acc[field] = 1;
      return acc;
    }, {});
    userSchema.index(indexFields, options);
    await User.createIndexes();
  }
};

if (process.env.NODE_ENV !== 'production') {
  addIndex(['nick'], { name: 'userNickUniqueIndex', unique: true });
  addIndex(['peaksAchieved'], { name: 'peaksAchievedUniqueIndex' });
}

export default User;
