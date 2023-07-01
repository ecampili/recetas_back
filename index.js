require("dotenv").config();
const express = require("express");
const cors = require("cors");
const co = require("cohere-ai");
const errorHandler = require("./middlewares/errorHandler");
const CustomError = require("./models/customError");

const app = express();
const PORT = process.env.PORT || 5000;
//const gr = require("./generateRecipe.js");

app.use(cors());
app.use(express.json());

const API_KEY = process.env.OPENAI_API_KEY;
const COHERE_KEY = process.env.COHERE_KEY;

co.init(COHERE_KEY);

app.post("/cohere", async (req, res, next) => {
  const data = req.body;
  if (data.lista) {
    let prompt = `You are a chef. These ingredients belong to the SAVORY AND SPICY group: salt, pepper, MAGGI soup cubes, olives, anchovies. These ingredients belong to the SWEET group: dulce de leche, sugar, honey, grapes, peaches. Use some  of the ingredients in this LIST: ${data.lista}, oil, salt, Maggi cubes, and pepper to create a delicious recipe. You don't need to use all the ingredients, and it is not allowed to have ingredients from the SAVORY AND SPICY group together with ingredients from the SWEET group in the same recipe. Return the recipe translated into Spanish formatted as an HTML <div>. Use only ingredients from the LIST, you don't need to use all the ingredients, and it is not allowed to have ingredients from the SAVORY AND SPICY group together with ingredients from the SWEET group in the same recipe.`;
    ////////////////

    try {
      const response = await co.generate({
        model: "command-nightly",
        prompt: prompt,
        max_tokens: 200,
        temperature: 0,
      });

      //console.log(response);
      /* const response2 = await response.json();
      console.log(response2); */
      // console.log(response.body.generations[0]);
      res.json(response.body.generations[0].text);
    } catch (error) {
      next(error);
    }
  }
});

app.post("/openai-api", async (req, res, next) => {
  const data = req.body;
  console.log({ data });
  if (data.lista) {
    let prompt = `Eres un cocinero.Si el contenido de esta LISTA:${data.lista} es una lista de ingredientes para cocinar quiero que agregues a esa lista  sal, pimienta, agua, azucar, aceite y crees una receta usando solamente ingredientes de esa lista. Investiga cual es la forma correcta de usar el producto Maggi. Si no,  responde:"Esto no parece una lista de ingredientes".  Utiliza solamente ingredientes de la LISTA, no es necesario que uses todos los ingredientes. Devuelve la receta formateada como un <div> HTML. Utiliza solamente ingredientes de la LISTA.`;
    ////////////////
    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-davinci-003",
        prompt: prompt,
        temperature: 0.1,
        max_tokens: 1000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      }),
    };
    try {
      const response = await fetch(
        "https://api.openai.com/v1/completions",
        options
      );

      const response2 = await response.json();
      console.log(response2);
      res.json(response2.choices[0].text);
      // res.json({ message: "done" });
    } catch (error) {
      next(error);
    }
  }
});

app.get("/", (req, res) => {
  res.json({ message: "Bienvenido a la Api de recetas" });
});

app.all("*", (req, res) => {
  throw new CustomError("404 - Not Found", 404);
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});
