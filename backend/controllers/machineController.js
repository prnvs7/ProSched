const Machine = require('../models/Machine');

exports.getMachines = async (req, res) => {
  try {
    const machines = await Machine.find({ user_id: req.user.id }).sort({ created_at: -1 });
    res.json(machines);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.createMachine = async (req, res) => {
  try {
    const newMachine = new Machine({
      ...req.body,
      user_id: req.user.id
    });
    const machine = await newMachine.save();
    res.json(machine);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.updateMachine = async (req, res) => {
  try {
    let machine = await Machine.findById(req.params.id);
    if (!machine) return res.status(404).json({ message: 'Machine not found' });
    if (machine.user_id.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    machine = await Machine.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(machine);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.deleteMachine = async (req, res) => {
  try {
    let machine = await Machine.findById(req.params.id);
    if (!machine) return res.status(404).json({ message: 'Machine not found' });
    if (machine.user_id.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Machine.findByIdAndDelete(req.params.id);
    res.json({ message: 'Machine removed' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};
