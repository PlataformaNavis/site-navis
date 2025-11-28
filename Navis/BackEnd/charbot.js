import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Ollama } from "ollama";
import { systemprompt } from './systemprompt.js';


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const ollama = new Ollama({
  host: "https://ollama.com",
  Authorization: `Bearer ${process.env.OLLAMA_API_KEY}`,
}
);

app.post('/api/navy', async (req, res) => {
  const { message } = req.body;

  try {
    const response = await ollama.chat({
      model: "gpt-oss:120b-cloud",
      messages: [{ role: "system", content: systemprompt },
        { role: "user", content: message }],
      stream: true,
    });

    res.setHeader('Content-Type', 'text/plain')
    var resposta = '';

    for await (const part of response) {
      // process.stdout.write(part.message.content);
      resposta += part.message.content;
    }
    res.send(resposta);
  } catch (error) {
    console.log(`ERROR ${error}`);
    res.status(500).send('Erro na conexão');
  }
});

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));
