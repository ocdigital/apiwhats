const fs = require('fs');
const { Client, Location } = require('./index');
const express = require('express')
const port = 4000
const SESSION_FILE_PATH = './session.json';
let sessionCfg;
if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionCfg = require(SESSION_FILE_PATH);
}

const client = new Client({ puppeteer: { headless: false }, session: sessionCfg });
// You can use an existing session and avoid scanning a QR code by adding a "session" object to the client options.
// This object must include WABrowserId, WASecretBundle, WAToken1 and WAToken2.

const qs = require('qs')
const axios = require('axios')
/*Definindo as rotas*/
const app = express()
const cors = require('cors')


app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(cors())



client.initialize();

client.on('qr', (qr) => {
    // NOTE: This event will not be fired if a session is specified.
    console.log('QR RECEIVED', qr);
});

client.on('authenticated', (session) => {
    console.log('AUTHENTICATED', session);
    sessionCfg = session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
        if (err) {
            console.error(err);
        }
    });
});

client.on('auth_failure', msg => {
    // Fired if session restore was unsuccessfull
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on('ready', () => {
    console.log('READY');
});



client.on('message', async msg => {

    if (msg.body == 'teste' || msg.body == 'Teste' ) {
        // Send a new message to the same chat
        client.sendMessage(msg.from, 'Bem vindo, caso queira realizar um agendamento escreva a palavra Agendamento');
    }

    if (msg.body == 'Agendamento' || msg.body == 'agendamento') {
        // Send a new message to the same chat
        client.sendMessage(msg.from, 'https://progastro.mgabr.com');       
        
    }

    


     



    



    if (msg.body == 'Não' || msg.body == 'não' || msg.body == 'nao' || msg.body == 'NÃO' || msg.body == 'NAO' ) {
        // Send a new message to the same chat
        client.sendMessage(msg.from, 'Sua consulta foi desmarcada, para um novo agendamento ligue no telefone 2222222222');
    } 
    else if (msg.body == 'SIM' || msg.body == 'sim'  || msg.body == 'Sim') {
    //console.log('MESSAGE RECEIVED', msg);

    var celular = msg.from
    var message = msg.body

    var data = {
        "celular": celular,
        "mensagem": message
    }

    var config = {
        method: 'post',
        url: 'http://144.217.100.77/whats/resposta.php',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    };

    axios(config)
        .then(function (response) {
           console.log(JSON.stringify(response.data));
        })
        .catch(function (error) {
            console.log(error);
        });

        client.sendMessage(msg.from, 'Obrigado pela confirmação 😊');
    }
    

    else if (msg.hasQuotedMsg) {
        console.log("ISSO E UMA RESPOSTA")

    } 
});

client.on('change_battery', (batteryInfo) => {
    // Battery percentage for attached device has changed
    const { battery, plugged } = batteryInfo;
    console.log(`Battery: ${battery}% - Charging? ${plugged}`);
});

client.on('disconnected', (reason) => {
    console.log('Client was logged out', reason);
});

app.post('/', function (req, res, ) {    
    //console.log(req.body)
    res.json(req.body)
    var celular = `55${req.body.numero}@c.us`
    var message = req.body.mensagem
    client.sendMessage(celular, message);

   var data = {
        "celular": celular,
        "mensagem": message
    }

    var config = {
        method: 'post',
        url: 'http://144.217.100.77/whats/mensagem.php',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    };

    axios(config)
        .then(function (response) {
           console.log(JSON.stringify(response.data));
        })
        .catch(function (error) {
            console.log(error);
        });



})




app.listen(port, () => {
    console.log('Exemplo Basivo na porta'+port)
})


