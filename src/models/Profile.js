const ProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    skills: { type: [String], required: true },
    portfolio: { type: String, required: true },
    availability: { type: String, enum: ['Full-Time', 'Part-Time', 'Freelance'], required: true },
    hourlyRate: { type: Number, required: true },
    experienceLevel: { type: String, enum: ['Junior', 'Mid', 'Senior'], required: true }, // New field
    bio: { type: String }, // New field
  });
  