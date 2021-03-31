var express = require("express");
var server = express();
var bodyParser = require("body-parser");


//MODEL

var model = {
    clients: {},
};
model.reset = function () {
    return model.clients = {}
}

model.addAppointment = (name, date) => {
    var client = model.clients
    if (!client[name]) {
      client[name] = [];
      return client[name].push({...date, status: 'pending'});
    }
    client[name].push({...date, status: 'pending'})
}

model.attend = function(name, date) {
    let matched = model.clients[name].find(el => {
        return el.date === date
    })    
    matched.status = 'attended'
}
model.expire = function(name, date) {
    let matched = model.clients[name].find(el => {
        return el.date === date
    })    
    matched.status = 'expired'
}

model.cancel = function(name, date) {
    let matched = model.clients[name].find(el => {
        return el.date === date
    })    
    matched.status = 'cancelled'
}

model.erase = function(name, filter) {
    if(filter === 'attended' || filter === 'expired' || filter === 'cancelled') {
        model.clients[name] = model.clients[name].filter(el => {
          return el.status !== filter
        })
    } else {
        model.clients[name] = model.clients[name].filter(el => {
          return el.date !== filter
        })
    }
}

model.getAppointments = function(name, status) {
    if(status) {
        let getAp = model.clients[name].filter(el => {
            return el.status === status
        })
        return getAp
    } else {
        return model.clients[name]
    } 
}

model.getClients = function() {
    return Object.keys(model.clients)
}

//SERVER

server.use(bodyParser.json());

server.get('/api', (req,res) => {
    res.send(model.clients)
})

server.post('/api/Appointments', (req,res) => {
    if(!req.body.client) {
        return res.status(400).send('the body must have a client property')
    } 
    
    if(typeof req.body.client !== 'string') {
        return res.status(400).send('client must be a string')
    } 
    
    model.addAppointment(req.body.client, req.body.appointment)
    let appointmentD = model.clients[req.body.client].find(el => {
        return el.date === req.body.appointment.date
    })
    res.send(appointmentD)
})

server.get('/api/Appointments/:name', (req, res) => {
    let client = req.params.name
    let date = decodeURI(req.query.date)
    let state = req.query.option

    if(!model.getClients().includes(client)) {
        return res.status(400).send('the client does not exist')
    }
    
    if(!model.clients[client].find(el => el.date === date)) {
        return res.status(400).send('the client does not have a appointment for that date')
    } 

    if(state !== 'attend' && state !== 'expire' && state !== 'cancel') {
        return res.status(400).send('the option must be attend, expire or cancel')
    }

    if(state === 'attend') {
        model.attend(client, date)
        let clientApp = model.getAppointments(client)
        let appointmentAtt = clientApp.find(el => el.date === date)
        return res.send(appointmentAtt)
    }

    if(state === 'expire') {
        model.expire(client, date)
        let clientApp = model.getAppointments(client)
        let appointmentAtt = clientApp.find(el => el.date === date)
        return res.send(appointmentAtt)
    }

    if(state === 'cancel') {
        model.cancel(client, date)
        let clientApp = model.getAppointments(client)
        let appointmentAtt = clientApp.find(el => el.date === date)
        return res.send(appointmentAtt)
    }
})

server.get('/api/Appointments/:name/erase', (req,res) => {
    let client = req.params.name
    let date = decodeURI(req.query.date)
    let state = req.query.option

    if(!model.getClients().includes(client)) {
        return res.status(400).send('the client does not exist')
    }

    
})

server.listen(3003);
module.exports = { model, server };

