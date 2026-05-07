const Worker = require('../models/Worker');

exports.getWorkers = async (req, res) => {
  try {
    const workers = await Worker.find({ user_id: req.user.id }).sort({ created_at: -1 });
    res.json(workers);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.createWorker = async (req, res) => {
  try {
    const newWorker = new Worker({
      ...req.body,
      user_id: req.user.id
    });
    const worker = await newWorker.save();
    res.json(worker);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.updateWorker = async (req, res) => {
  try {
    let worker = await Worker.findById(req.params.id);
    if (!worker) return res.status(404).json({ message: 'Worker not found' });
    if (worker.user_id.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    worker = await Worker.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(worker);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.deleteWorker = async (req, res) => {
  try {
    let worker = await Worker.findById(req.params.id);
    if (!worker) return res.status(404).json({ message: 'Worker not found' });
    if (worker.user_id.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Worker.findByIdAndDelete(req.params.id);
    res.json({ message: 'Worker removed' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};
