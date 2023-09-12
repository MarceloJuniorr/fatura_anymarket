import express from 'express';
import {getDate} from './utils.js';
import axios from "axios";
import { allOrders, insertOrder } from './querys.js';
import { config } from './config.js';
import { CronJob } from 'cron';

const { port, storeno, gumgaToken } = config
const { cronFatura } = config.cron




const app = express();
app.use(express.json());


const enviaFaturadas = async (storeno, gumgaToken, date ) => {
    
    const hubId=4
    const orders = await allOrders(date, hubId, storeno)
    const notSend = []
    const send = []
    if ( !orders[0]  ) {
        return console.log('Não existem notas a serem enviadas');
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
            let objectOrder = {
                ordnoweb: order.ordnoweb,
                ordno: order.ordno
            }
            await axios.put(url, order.xml, config)
            .then(async res => {
                send.push(objectOrder)
                console.log(res.status + 'Pedido enviado para anymarket: ' + order.ordno);
                const insert = await insertOrder(order.ordno, order.storeno).catch(err => {console.log(err)});
                console.log(insert);
            }).catch(err => {
                console.log(err)
                notSend.push(objectOrder)
            });
            
        } catch (error) {
            console.log(error);
        }
        
    }
    
    return { enviados: send,
        naoEnviados: notSend}
        
        
    }
    
    app.post('/fatura', async (req,res) => {
        const {storeno, gumgaToken, date} = req.body
        
        if (!storeno || !gumgaToken || !date) {
            return res.status(400).json({message: `Verifique as propriedades obrigatórias(storeno, gumgaToken, date)`})        
        }
        try {
            await enviaFaturadas(storeno, gumgaToken, date).then((result) => { return res.status(200).json(result.data)})
        } catch (error) {
            console.log(error)
            return res.status(400).json(error.data) 
        }
        
    })
    
    const job = new CronJob(cronFatura, async () => {
        console.log(`Inicializando rotina do cron `);
        let date = getDate()
        if (!storeno || !gumgaToken ) {
            console.log(`Verifique as propriedades obrigatórias no YML (STORENO, GUMGATOKEN)`);
        } else {
            console.log(`preparando funcao enviaFaturadas`);
            await enviaFaturadas(storeno, gumgaToken, date).catch((error) => console.log(error))
        }
    },null, true, 'America/Sao_Paulo')

    app.listen(port, () => {
        console.log(`Funcionando na porta ${port}`)
        job.start()
        console.log(`Cron inicializado`);
    })