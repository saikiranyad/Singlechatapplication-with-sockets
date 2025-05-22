const express = require('express')
const { sendmessage, getallmessage, getmessagebyid, deletemessage, updatemessage, isReadmessage } = require('../controllers/messageController')
const upload = require('../middleware/multer')
const authmiddleware = require('../middleware/authmiddleware')


const messagerouter = express.Router()
messagerouter.post('/send',authmiddleware,upload.array('files',10),sendmessage)
messagerouter.get('/getallmesssages/:id',authmiddleware,getallmessage)

messagerouter.get('/getmessage/:id',authmiddleware,getmessagebyid)

messagerouter.delete('/deletemessage/:id',authmiddleware,deletemessage)
messagerouter.put('/updatemessage/:id',upload.single('file'),authmiddleware,updatemessage)
messagerouter.get('/readmessage/:id',authmiddleware,isReadmessage)



// will do later if i know
// messagerouter.get('/deliveredmessage/:id')
// messagerouter.get('/getallmessages/:id')
// messagerouter.get('/getmessage')

module.exports = messagerouter