const express = require("express")
const app = express()
const fs = require("fs")
const {Sequelize, DataTypes} = require('sequelize')

app.use(express.json())
app.use(express.urlencoded())

// DB connection
const conn = new Sequelize('products_inventory', 'root', '12345678', {
    host: '127.0.0.1',
    dialect: 'mysql',
    
})

// Models
const Category = conn.define("Category", {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    }
}, {})

const Subcategory = conn.define("Subcategory", {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
})

const Product = conn.define("Product", {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    currency: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "USD"
    },
    stock: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0
    },
    rating: {
        type: DataTypes.FLOAT.UNSIGNED,
        allowNull: false,
        defaultValue: 0.0
    },
    price: {
        type: DataTypes.FLOAT.UNSIGNED,
        allowNull: false,
        defaultValue: 0.0
    },
    subcategory_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
})

Subcategory.belongsTo(Category, {
    foreignKey: "subcategory_id"
})
Category.hasMany(Subcategory, {
    foreignKey: "subcategory_id"
})
Product.belongsTo(Subcategory, {
    foreignKey: "subcategory_id"
})
Subcategory.hasMany(Product, {
    foreignKey: "subcategory_id"
})

// conn.sync({ force: true });

async function fillInCategories() {
    /*
        1. retreiving categories from products.json,
        2. filtering out only the unique categories,
        3. sort subcategories alphabetically and in ascending order,
        4. Register the categories in the db
    */

    const { products } = JSON.parse(fs.readFileSync("products.json", {encoding: "utf-8"}))
    
    //let categories = products.map(product => product.category)

    const categories = [...new Set(products.map(product => product.category))]
    categories.sort()

    for(const category of categories) {
        await Category.create({name:category})
    }

    fillInSubcategories()
}

fillInCategories();

async function fillInSubcategories() {
    const { products } = JSON.parse(fs.readFileSync("products.json", {encoding: "utf-8"}))

    const subcategories = new Map()
    for(const product of products) {
        subcategories.set(product.subcategory, product.category)
    }

    console.log(subcategories)

    for(const subcategory of subcategories) {
        await Subcategory.create({
            name: subcategory[0],
            category_id: (await Category.findOne({where: {name: subcategory[1]}}))?.id
        })
    }
}

/* FUNCTIONS */
function idGenerator (products) {
    return products.length + 1
}


/* MIDDLEWARES */
function findIdx(req, res, next) {
    const data = JSON.parse(fs.readFileSync("./products.json", { encoding: "utf-8" }))

    const id = req.params.id
    const productIdx = data.products.findIndex((prod) => prod.id == id)

    if (productIdx === -1) {
        return res.status(404).json({
            "msg": "Product not found",
            "productId": id
        })
    }

    req.products = data.products
    req.productIdx = productIdx
    req.count = data.count

    next()
}


/* ENDPOINTS */
app.get("/products", (req, res) => {
    const { products } = JSON.parse(fs.readFileSync("./products.json", { encoding: "utf-8" }))
    const { category, subcategory, search } = req.query

    //Filters 
    let inventory = products
    
    if (category) {
        inventory = inventory.filter(
            pro => pro.category === category
        )
    }
    if (subcategory) {
        inventory = inventory.filter(
            pro => pro.subcategory === subcategory
        )
    }
    if (search) {
        inventory = inventory.filter(
            pro => pro.name.toLowerCase().includes(search.toLowerCase())
        )
    }
    res.json(inventory)
})

app.post('/products', (req, res) => {
    const {
        name,
        category,
        subcategory,
        price,
        currency,
        stock,
        rating
    } = req.body

    const jsonData = JSON.parse(fs.readFileSync("./products.json", { encoding: "utf-8" }));

    const newProduct = {
        id: idGenerator(jsonData.products),
        name,
        category,
        subcategory,
        price,
        currency,
        stock,
        rating
    }

    jsonData.products.push(newProduct)
    jsonData.count = jsonData.products.length

    fs.writeFileSync(
        "./products.json",
        JSON.stringify(jsonData, null, 2)
    )
    res.status(201).json({
        message: 'Data was correctly stored',
        product: newProduct
    })
})

app.put('/products/:id', findIdx, (req, res) => {
    const {
        name,
        category,
        subcategory,
        price,
        currency,
        stock,
        rating
    } = req.body

    const { products, productIdx, count } = req

    products[productIdx] = {
        ...products[productIdx],
        name, 
        category,
        subcategory,
        price,
        currency,
        stock,
        rating
    }

    const jsonData = JSON.stringify({ count, products })
    fs.writeFileSync("./products.json", jsonData);

    res.status(200).json({
        "msg": "Product updated successfully",
    })
})

app.delete('/products/:id', findIdx, (req, res) => {
    const { products, productIdx, count} = req

    products.splice(productIdx, 1)
    const newCount = count - 1

    const jsonData = JSON.stringify({ count: newCount, products })
    fs.writeFileSync("./products.json", jsonData);
    
    res.status(204).end()
})
    
app.listen(9000, () => console.log("Server running on port 9000"))