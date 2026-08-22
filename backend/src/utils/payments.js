const Order = require("../models/Order");
const { decrementStock } = require("./stock");

async function markOrderPaid(order, paymentIntentId) {
  if (!order || order.paymentStatus === "paid") {
    return order;
  }
  order.paymentStatus = "paid";
  order.orderStatus = "processing";
  if (paymentIntentId) {
    order.stripePaymentIntentId = paymentIntentId;
  }
  await order.save();
  await decrementStock(order.items);
  return order;
}

async function markOrderPaidById(orderId, paymentIntentId) {
  const order = await Order.findById(orderId);
  if (!order) return null;
  return markOrderPaid(order, paymentIntentId);
}

module.exports = { markOrderPaid, markOrderPaidById };
