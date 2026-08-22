const User = require("../models/User");
const Category = require("../models/Category");
const Product = require("../models/Product");

const images = {
  phone:
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80",
  laptop:
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80",
  headphones:
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
  watch:
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
  shirt:
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
  shoes:
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
  bag: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80",
  dress:
    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80",
  home: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80",
  beauty:
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80",
};

async function seedIfEmpty() {
  const count = await Product.countDocuments();
  if (count > 0) return false;

  const adminEmail = process.env.ADMIN_EMAIL || "admin@amer.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin123!";

  const adminExists = await User.findOne({ email: adminEmail });
  if (!adminExists) {
    await User.create({
      firstName: "Site",
      lastName: "Admin",
      email: adminEmail,
      phone: "01700000000",
      address: "Dhaka, Bangladesh",
      password: adminPassword,
      role: "admin",
    });
  }

  const buyerExists = await User.findOne({ email: "buyer@amer.com" });
  if (!buyerExists) {
    await User.create({
      firstName: "Demo",
      lastName: "Buyer",
      email: "buyer@amer.com",
      phone: "01800000000",
      address: "Gulshan, Dhaka",
      password: "Buyer123!",
      role: "user",
      shippingAddresses: [
        {
          label: "Home",
          fullName: "Demo Buyer",
          phone: "01800000000",
          addressLine: "Gulshan, Dhaka",
          city: "Dhaka",
          isDefault: true,
        },
      ],
    });
  }

  let electronics = await Category.findOne({ slug: "electronics" });
  let fashion = await Category.findOne({ slug: "fashion" });
  let home = await Category.findOne({ slug: "home" });
  let beauty = await Category.findOne({ slug: "beauty" });

  if (!electronics || !fashion || !home || !beauty) {
    await Category.deleteMany({});
    [electronics, fashion, home, beauty] = await Category.insertMany([
      { name: "Electronics", slug: "electronics", image: images.phone },
      { name: "Fashion", slug: "fashion", image: images.shirt },
      { name: "Home", slug: "home", image: images.home },
      { name: "Beauty", slug: "beauty", image: images.beauty },
    ]);
  }

  await Product.insertMany([
    {
      name: "Smart Phone X1",
      description: "6.5-inch display, 128GB storage, dual camera.",
      price: 299,
      flashSalePrice: 249,
      isFlashSale: true,
      isPopular: true,
      stock: 40,
      category: electronics._id,
      image: images.phone,
    },
    {
      name: "Ultrabook Pro 14",
      description: "Lightweight laptop for work and study.",
      price: 899,
      isPopular: true,
      stock: 15,
      category: electronics._id,
      image: images.laptop,
    },
    {
      name: "Wireless Headphones",
      description: "Noise-cancelling over-ear headphones.",
      price: 129,
      flashSalePrice: 89,
      isFlashSale: true,
      isPopular: true,
      stock: 60,
      category: electronics._id,
      image: images.headphones,
    },
    {
      name: "Classic Watch",
      description: "Minimal analog watch with leather strap.",
      price: 79,
      isPopular: true,
      stock: 35,
      category: fashion._id,
      image: images.watch,
    },
    {
      name: "Cotton Tee",
      description: "Soft everyday cotton t-shirt.",
      price: 19,
      flashSalePrice: 12,
      isFlashSale: true,
      stock: 100,
      category: fashion._id,
      image: images.shirt,
    },
    {
      name: "Running Shoes",
      description: "Breathable sneakers for daily runs.",
      price: 69,
      isPopular: true,
      stock: 45,
      category: fashion._id,
      image: images.shoes,
    },
    {
      name: "City Backpack",
      description: "Water-resistant backpack with laptop sleeve.",
      price: 49,
      stock: 25,
      category: fashion._id,
      image: images.bag,
    },
    {
      name: "Summer Dress",
      description: "Light floral dress for warm days.",
      price: 39,
      flashSalePrice: 29,
      isFlashSale: true,
      stock: 30,
      category: fashion._id,
      image: images.dress,
    },
    {
      name: "Cozy Throw Pillow",
      description: "Soft accent pillow for living room.",
      price: 24,
      isPopular: true,
      stock: 50,
      category: home._id,
      image: images.home,
    },
    {
      name: "Glow Skincare Set",
      description: "Daily cleanser and moisturizer duo.",
      price: 45,
      isFlashSale: true,
      flashSalePrice: 35,
      isPopular: true,
      stock: 70,
      category: beauty._id,
      image: images.beauty,
    },
  ]);

  console.log("Demo data seeded");
  console.log(`Admin: ${adminEmail} / ${adminPassword}`);
  console.log("Buyer: buyer@amer.com / Buyer123!");
  return true;
}

module.exports = seedIfEmpty;
