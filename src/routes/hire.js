const Joi = require('joi');

// Validation Schema
const hireRequestSchema = Joi.object({
  clientId: Joi.string().required(),
  talentId: Joi.string().required(),
  details: Joi.string().min(10).required(),
});

router.post('/', async (req, res) => {
  const { error } = hireRequestSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { clientId, talentId, details } = req.body;
  try {
    const newHireRequest = new HireRequest({ clientId, talentId, details });
    await newHireRequest.save();
    res.status(201).json(newHireRequest);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
