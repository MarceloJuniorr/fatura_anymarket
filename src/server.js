import express from 'express';
import {getDate} from './utils.js';
import axios from "axios";
import { allOrders, insertOrder } from './querys.js';


const app = express();
app.use(express.json());
const PORT = 3014;
app.listen(PORT, () => {console.log(`Funcionando na porta ${PORT}`)})

console.log(getDate());


app.post('/fatura', async (req,res) => {
    const { storeno, gumgaToken } = req.body
    const date = req.body.date ? req.body.date : getDate();
   if (!storeno) {
        return res.status(400).json('Informe o "storeno."')
    }

    const hubId=4

    const orders = await allOrders(date, hubId, storeno)
    const notSend = []
    const send = []
    if ( orders === [] ) {
        return res.status(200).json(`Não existem notas a ser faturadas no dia ${date}.`)
    } 

    console.log(orders);

    for await (let order of orders ) { 

        try {
            let url = `http://api.anymarket.com.br/v2/orders/${order.ordnoweb}/nfe`
            let config = {
                    headers:{
                        'Accept': 'application/json',
                        'Content-Type': 'application/xml',
                        gumgaToken
                    }
                }
            await axios.put(url, order.xml, config)
                .then(async res => {
                    send.push(order.ordnoweb + '-' + order.ordno)
                    console.log(res.status + 'Pedido enviado para anymarket: ' + order.ordno);
                    const insert = await insertOrder(order.ordno, order.storeno);
                    console.log(insert);
                }).catch(err => {
                    console.log(err)
                    notSend.push(order.ordnoweb + '-' + order.ordno)
                });
                
        } catch (error) {
            console.log(error);
        }

    }

    return res.status(200).json({
        'enviados': send,
        'naoEnviados': notSend
    })


    
})