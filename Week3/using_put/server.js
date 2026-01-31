const express = require("express")
const app = express()
const fs = require("fs")


app.use(express.json())
app.use(express.urlencoded())

function idGenerator (products) {
    return products.length + 1
}

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

app.put('/products/:id', (req, res

    
) => {
    const id = req.params.id
    const { count, products } = JSON.parse(fs.readFileSync("./products.json", { encoding: "utf-8" }))

    const productIdx = products.findIndex((prod) => prod.id == id)

    if (productIdx === -1) {
        return res.status(404).json({
            "msg": "Product not found",
            "productId": id
        })
    }

    const {
        name,
        category,
        subcategory,
        price,
        currency,
        stock,
        rating
    } = req.body

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
    

app.listen(9000, () => console.log("Server running on port 9000"))