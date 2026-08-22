const Product = require("../models/Product");

async function decrementStock(orderItems) {
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.qty },
    });
  }
}

module.exports = { decrementStock };
