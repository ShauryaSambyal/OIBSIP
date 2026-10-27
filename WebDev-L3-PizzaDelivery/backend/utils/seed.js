import dotenv from 'dotenv'
import mongoose from 'mongoose'
import User from '../models/User.js'
import Inventory from '../models/Inventory.js'
import Pizza from '../models/Pizza.js'

dotenv.config()

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pizzadelivery')
    console.log('MongoDB connected for seeding')

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@pizzadelivery.com'
    const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@12345'

    let admin = await User.findOne({ email: adminEmail })
    if (!admin) {
      admin = new User({
        name: 'System Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        isVerified: true
      })
      await admin.save()
      console.log(`Admin account seeded: ${adminEmail}`)
    } else {
      console.log(`Admin already exists: ${adminEmail}`)
    }

    const inventoryCount = await Inventory.countDocuments()
    if (inventoryCount === 0) {
      const items = [
        {
          category: 'base',
          name: 'Classic Hand-Tossed',
          stock: 45,
          threshold: 20,
          price: 120,
          description: 'Traditional garlic-brushed dough with crisp golden exterior and airy crumb.',
          imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80'
        },
        {
          category: 'base',
          name: 'Thin Crust',
          stock: 40,
          threshold: 20,
          price: 140,
          description: 'Ultra-crispy Roman style crust made with semolina flour.',
          imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80'
        },
        {
          category: 'base',
          name: 'Pan Pizza',
          stock: 35,
          threshold: 20,
          price: 150,
          description: 'Thick, buttery crust baked in a seasoned cast-iron skillet.',
          imageUrl: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&w=600&q=80'
        },
        {
          category: 'base',
          name: 'Cheese Stuffed Crust',
          stock: 30,
          threshold: 20,
          price: 190,
          description: 'Melted string mozzarella tucked into folded garlic edges.',
          imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80'
        },
        {
          category: 'base',
          name: 'Gluten-Free Crust',
          stock: 22,
          threshold: 20,
          price: 180,
          description: 'Stone-milled cauliflower and almond flour crust, light and digestible.',
          imageUrl: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&w=600&q=80'
        },

        {
          category: 'sauce',
          name: 'Classic Marinara',
          stock: 65,
          threshold: 20,
          price: 40,
          description: 'San Marzano slow-simmered tomatoes, fresh basil, and extra virgin olive oil.',
          imageUrl: 'https://images.unsplash.com/photo-1572449043416-55f4685c9bb7?auto=format&fit=crop&w=600&q=80'
        },
        {
          category: 'sauce',
          name: 'Spicy Arrabiata',
          stock: 55,
          threshold: 20,
          price: 50,
          description: 'Zesty red pepper flakes, garlic confit, and crushed plum tomatoes.',
          imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=600&q=80'
        },
        {
          category: 'sauce',
          name: 'Creamy Garlic Alfredo',
          stock: 45,
          threshold: 20,
          price: 60,
          description: 'Rich white reduction of sweet cream, roasted garlic, and aged parmesan.',
          imageUrl: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=600&q=80'
        },
        {
          category: 'sauce',
          name: 'Smoky BBQ Sauce',
          stock: 42,
          threshold: 20,
          price: 55,
          description: 'Sweet hickory molasses glaze with apple cider vinegar bite.',
          imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'
        },
        {
          category: 'sauce',
          name: 'Basil Pesto',
          stock: 35,
          threshold: 20,
          price: 65,
          description: 'Fresh Genovese basil, pine nuts, pecorino, and cold-pressed olive oil.',
          imageUrl: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=600&q=80'
        },

        {
          category: 'cheese',
          name: 'Mozzarella',
          stock: 60,
          threshold: 20,
          price: 80,
          description: 'Whole milk shredded low-moisture mozzarella with iconic cheese pull.',
          imageUrl: 'https://images.unsplash.com/photo-1589881133595-a3c085cb731d?auto=format&fit=crop&w=600&q=80'
        },
        {
          category: 'cheese',
          name: 'Aged Cheddar',
          stock: 45,
          threshold: 20,
          price: 90,
          description: 'Sharp Wisconsin orange cheddar offering savory tang.',
          imageUrl: 'https://images.unsplash.com/photo-1618164436241-4473940d1f5c?auto=format&fit=crop&w=600&q=80'
        },
        {
          category: 'cheese',
          name: 'Parmesan Reggiano',
          stock: 38,
          threshold: 20,
          price: 100,
          description: '24-month cave-aged Italian hard cheese microplaned finely.',
          imageUrl: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&w=600&q=80'
        },
        {
          category: 'cheese',
          name: 'Smoked Gouda',
          stock: 30,
          threshold: 20,
          price: 110,
          description: 'Dutch curd cheese smoked over beechwood chips.',
          imageUrl: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=600&q=80'
        },
        {
          category: 'cheese',
          name: 'Vegan Mozzarella',
          stock: 25,
          threshold: 20,
          price: 95,
          description: 'Plant-based organic cashew curd cheese with seamless melting texture.',
          imageUrl: 'https://images.unsplash.com/photo-1559561853-08451507cbe7?auto=format&fit=crop&w=600&q=80'
        },

        {
          category: 'vegetable',
          name: 'Bell Peppers',
          stock: 55,
          threshold: 20,
          price: 35,
          description: 'Tri-color sliced red, yellow, and green bell peppers.',
          imageUrl: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=600&q=80'
        },
        {
          category: 'vegetable',
          name: 'Sliced Mushrooms',
          stock: 45,
          threshold: 20,
          price: 45,
          description: 'Earthy white button and cremini mushrooms sauteed in herb butter.',
          imageUrl: 'https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?auto=format&fit=crop&w=600&q=80'
        },
        {
          category: 'vegetable',
          name: 'Red Onions',
          stock: 65,
          threshold: 20,
          price: 30,
          description: 'Crisp hand-sliced sweet red onions.',
          imageUrl: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=600&q=80'
        },
        {
          category: 'vegetable',
          name: 'Black Olives',
          stock: 48,
          threshold: 20,
          price: 45,
          description: 'Kalamata cured pitted black olives.',
          imageUrl: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=600&q=80'
        },
        {
          category: 'vegetable',
          name: 'Jalapeños',
          stock: 42,
          threshold: 20,
          price: 40,
          description: 'Pickled and charred jalapeño pepper coins.',
          imageUrl: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=600&q=80'
        },
        {
          category: 'vegetable',
          name: 'Sweet Corn',
          stock: 50,
          threshold: 20,
          price: 35,
          description: 'Tender golden kernels bursting with sweetness.',
          imageUrl: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80'
        },
        {
          category: 'vegetable',
          name: 'Fresh Baby Spinach',
          stock: 35,
          threshold: 20,
          price: 40,
          description: 'Organic crisp baby spinach leaves wilted slightly upon baking.',
          imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80'
        },
        {
          category: 'vegetable',
          name: 'Cherry Tomatoes',
          stock: 40,
          threshold: 20,
          price: 40,
          description: 'Halved sweet vine-ripened cherry tomatoes.',
          imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80'
        }
      ]
      await Inventory.insertMany(items)
      console.log(`Seeded ${items.length} inventory items`)
    }

    const pizzaCount = await Pizza.countDocuments()
    if (pizzaCount === 0) {
      const pizzas = [
        {
          name: 'Margherita Classica',
          description: 'The timeless classic. San Marzano tomato puree, artisanal fresh mozzarella, basil leaves, and cold-pressed extra virgin olive oil.',
          price: 299,
          imageUrl: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=800&q=80',
          category: 'veg',
          isBestseller: true,
          base: 'Classic Hand-Tossed',
          sauce: 'Classic Marinara',
          cheese: 'Mozzarella',
          vegetables: ['Fresh Baby Spinach', 'Cherry Tomatoes']
        },
        {
          name: 'Farmhouse Garden Supreme',
          description: 'Packed with crunchy garden bell peppers, sliced button mushrooms, crisp red onions, and sweet golden corn over herb tomato marinara.',
          price: 379,
          imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80',
          category: 'veg',
          isBestseller: true,
          base: 'Pan Pizza',
          sauce: 'Classic Marinara',
          cheese: 'Mozzarella',
          vegetables: ['Bell Peppers', 'Sliced Mushrooms', 'Red Onions', 'Sweet Corn']
        },
        {
          name: 'Spicy Fiery Paneer & Jalapeño',
          description: 'Marinated cottage cheese chunks, fiery pickled jalapeños, red paprika, and smoky spiced tomato sauce topped with aged cheddar.',
          price: 399,
          imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
          category: 'veg',
          isBestseller: false,
          base: 'Thin Crust',
          sauce: 'Spicy Arrabiata',
          cheese: 'Aged Cheddar',
          vegetables: ['Jalapeños', 'Bell Peppers', 'Red Onions']
        },
        {
          name: 'Truffle Mushroom & Roasted Garlic',
          description: 'A decadent white pie with wild cremini mushrooms, roasted whole garlic cloves, rich alfredo sauce, and parmesan shavings.',
          price: 449,
          imageUrl: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=800&q=80',
          category: 'veg',
          isBestseller: true,
          base: 'Thin Crust',
          sauce: 'Creamy Garlic Alfredo',
          cheese: 'Parmesan Reggiano',
          vegetables: ['Sliced Mushrooms', 'Fresh Baby Spinach']
        },
        {
          name: 'Quattro Formaggi (Four Cheeses)',
          description: 'A luxurious blend of fresh mozzarella, aged cheddar, smoked gouda, and parmesan baked till bubbly and golden.',
          price: 469,
          imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
          category: 'veg',
          isBestseller: false,
          base: 'Cheese Stuffed Crust',
          sauce: 'Classic Marinara',
          cheese: 'Mozzarella',
          vegetables: ['Black Olives']
        },
        {
          name: 'Smoky BBQ Mediterranean Harvest',
          description: 'Tangy barbecue reduction topped with smoked gouda, sweet corn, cherry tomatoes, kalamata black olives, and charred onions.',
          price: 419,
          imageUrl: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&w=800&q=80',
          category: 'veg',
          isBestseller: false,
          base: 'Classic Hand-Tossed',
          sauce: 'Smoky BBQ Sauce',
          cheese: 'Smoked Gouda',
          vegetables: ['Sweet Corn', 'Cherry Tomatoes', 'Black Olives', 'Red Onions']
        }
      ]
      await Pizza.insertMany(pizzas)
      console.log(`Seeded ${pizzas.length} pizza varieties`)
    }

    console.log('Database seeding completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('Seeding failed:', error)
    process.exit(1)
  }
}

seedData()
