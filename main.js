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
    res.render("main/home.html", {})
})

app.get("/:page?", function(req, res) {
    const page = req.params.page || "Home"

    res.render(`main/${page}.html`, {}, (err, html) => {
        if (err) res.redirect("/")
        else res.send(html)
    })
})

app.get('/auth/logout', (req, res) => {
    req.session.destroy((err) => { res.redirect('/') })
})

app.get("/auth/sign", (req, res) => {
    res.render(`auth/sign.html`, {}, (err, html) => {
        if (err) res.redirect("/")
        else res.send(html)
    })
})


const PORT = 8001
app.listen(PORT, () => {
    console.log(`Brain Burst running on Page http://localhost:${PORT}`)
})