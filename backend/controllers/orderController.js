const Order = require('../models/Order');

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.user.id }).sort({ created_at: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.createOrder = async (req, res) => {
  try {
    const newOrder = new Order({
      ...req.body,
      user_id: req.user.id
    });
    const order = await newOrder.save();
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.updateOrder = async (req, res) => {
  try {
    let order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user_id.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: req.body, updated_at: Date.now() },
      { new: true }
    );
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    let order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user_id.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order removed' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};
