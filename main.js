const express = require("express")
const bodyParser = require("body-parser")
const path = require("path")
const mongodb = require("mongodb")

const app = express()

const dbUrl = 'mongodb://localhost:27017'
const dbName = "DevMesh"

app.engine("html", require("ejs").renderFile)
app.set("view engine", "html")
app.use("/public", express.static(path.join(__dirname, "public")))
app.set("views", path.join(__dirname, "/views"))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get("/", function(req, res) {
    res.render("index.html", {})
})

const PORT = 8001
app.listen(PORT, () => {
    console.log(`Brain Burst running on Page http://localhost:${PORT}`)
})