import fastify from 'fastify';
import view from '@fastify/view';
import handlebars from 'handlebars';
import {getData, getHash} from "./api.js";
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import process from "process";

const server = fastify();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


server.register(view, {
    engine: {
        handlebars,
    },
    includeViewExtension: true,
    templates: resolve(__dirname, '../'),
    options: {
        partials: {
            header: '/templates/header.hbs',
            footer: '/templates/footer.hbs',
            character: '/templates/perso.hbs'
        },
    },
});

console.log("Je suis Marvel")
const timestamp = Math.floor(Date.now() / 1000);

const publicKey = "431f1240ba8d869ee6d67f8433768f48";
const privateKey = "656dbea313d8fca06217327df1944e42a39ff167";
const hash = await getHash(publicKey, privateKey, timestamp);

const url = "https://gateway.marvel.com:443/v1/public/characters?ts="+timestamp.toString()+"&apikey="+publicKey+"&hash="+hash.toString();

let data = await getData(url);

let personnages = [];

for(let i = 0; i<data.data.results.length; ++i) {
    if (!data.data.results[i].thumbnail.path.toString().includes("image_not_available")) {
        personnages[i] = data.data.results[i];
    }
}
console.log("toto",personnages);
server.get('/', (request, reply) => {
    reply.view('/templates/index.hbs', { characters: personnages });
});
server.listen({ port: 3000, host: '127.0.0.1' })
    .then((address) => console.log(`Server listening at ${address}`))
    .catch((err) => {
        console.log(err);
        process.exit(1);
    });
