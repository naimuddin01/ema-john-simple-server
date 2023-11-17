const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();//enviroment veriable ke payor jonno  .config korte hoy
const SSLCommerzPayment = require('sslcommerz-lts')
const app = express();
const port = process.env.PORT || 5000;

//Start moiddleware
//corse er maddome amader client r server alada 2 ta port e cholle o resource shering korte kno pblm hobe na
app.use(cors());
//express holo, string data ke json e convert kore
//amra jothy client side theke data backend e pathai tokhon amra data ke stringgify kore backend e pathi (Post request er maddome)
//stringefy data ta ase .body te r sei data ke jeson e convert kore express 
app.use(express.json());
//End moiddleware

const store_id = `${process.env.SSLCommerz_StoreID}`
const store_passwd = `${process.env.SSLCommerz_StorePassword}`
const is_live = false //true for live, false for sandbox

//mongo theke nite hobe
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.j5ivzwd.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, { serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true, } });
//mongo theke nite hobe

//nicher function er vitore try er modde CURD  operetion cholbe
// async function run(){
//     try {
//         const productsCollection = client.db('emaJohn').collection('products');

//         app.get('/products', async(req, res, next) => {

//         })
//     }
//     finally{

//     }
// }
// run().catch(err => console.error(err));
//nicher function er vitore try er modde CURD  operetion cholbe

async function run() {
    try {
        const productsCollection = client.db('emaJohn').collection('products');
        const orderCollections = client.db('emaJohn').collection('orders');

        app.get('/products', async (req, res, next) => {
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);
            console.log(page, size)
            const query = {};
            const cursor = productsCollection.find(query);
            // const products = await cursor.toArray();
            //koto gulo dta dackte chi se jonno
            // const products = await cursor.limit(10).toArray();

            //page r size  hisabe data ke vag kore neyor jonno
            const products = await cursor.skip(page * size).limit(size).toArray();

            //koto gulo data ase seta dekhar jonno, eta lagbe paginage er somoy ekta page e koto gulo data dibo seta hosab er jonno
            const count = await productsCollection.estimatedDocumentCount();//koto gulo data ase seta dekhar jonno
            // res.send(products);//data ta ekta array hoye jabe
            // res.send({products});//data ta ekta objet hoye jabe r tar vitore product er value gulo data hobe
            res.send({ count, products });//data ta ekta objet hoye jabe r tar votore 2 ta property thakte ekta count r ekta product
        });

        //pagination er por cart er data anar jonno
        app.post('/productsByIds', async (req, res) => {
            const ids = req.body;
            // console.log(ids);
            const query = {};
            const cursor = productsCollection.find(query);
            const produsts = await cursor.toArray();
            res.send(produsts);
        })
        //pagination er por cart er data anar jonno

        //order
        app.post('/order', async (req, res) => {
            const orderInfo = req.body;
            console.log('order', orderInfo);
            const tran_id = new ObjectId().toString();
            const data = {
                total_amount: orderInfo.totalAmount,
                currency: 'BDT',
                tran_id: tran_id, // use unique tran_id for each api call
                success_url: `http://localhost:5000/payment/success/${tran_id}`,
                fail_url: `http://localhost:5000/payment/fail/${tran_id}`,
                cancel_url: 'http://localhost:3030/cancel',
                ipn_url: 'http://localhost:3030/ipn',
                shipping_method: 'Courier',
                product_name: 'Computer.',
                product_category: 'Electronic',
                product_profile: 'general',
                cus_name: orderInfo.name,
                cus_email: orderInfo.email,
                cus_add1: orderInfo.adderss,
                cus_add2: 'Dhaka',
                cus_city: 'Dhaka',
                cus_state: 'Dhaka',
                cus_postcode: '1000',
                cus_country: 'Bangladesh',
                cus_phone: orderInfo.phoneNumber,
                cus_fax: '01711111111',
                ship_name: 'Customer Name',
                ship_add1: 'Dhaka',
                ship_add2: 'Dhaka',
                ship_city: 'Dhaka',
                ship_state: 'Dhaka',
                ship_postcode: 1000,
                ship_country: 'Bangladesh',
            };
            console.log('data', data)
            const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
            sslcz.init(data).then(apiResponse => {
                // Redirect the user to payment gateway
                let GatewayPageURL = apiResponse.GatewayPageURL
                res.send({url:GatewayPageURL})
                const finalOrder = {
                    orderInfo, paidStatus:false, tranjectionId: tran_id,
                };
                const result = orderCollections.insertOne(finalOrder)
                console.log('Redirecting to: ', GatewayPageURL)
            });

            app.post('/payment/success/:tranId', async (req,res) => {
                console.log(req.params.tranId);
                const result = await orderCollections.updateOne({tranjectionId: req.params.tranId },
                    {
                        $set: {
                            paidStatus: true,
                        }
                    }    
                )
                if(result.modifiedCount > 0){
                    res.redirect(`http://localhost:3000/payment/success/${req.params.tranId}`)
                }
            })
            app.post('/payment/fail/:tranId', async (req,res) => {
                console.log(req.params.tranId);
                const result = await orderCollections.deleteOne({tranjectionId: req.params.tranId})
                if(result.deletedCount){
                    res.redirect(`http://localhost:3000/payment/fail/${req.params.tranId}`)
                }
                
            })

        })
    }
    finally {

    }
}
run().catch(err => console.error(err));


app.get('/', (req, res) => {
    res.send('ema john server is running');
})

app.listen(port, () => {
    console.log(`ema john running on : ${port}`);
});