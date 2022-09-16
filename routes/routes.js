const axios=require('axios')
const express= require("express")
const router=express.Router()

//to get all currrency code
const getcode =async ()=>{
return new Promise(async(resolve,reject)=>{
    axios.get('https://open.er-api.com/v6/latest/INR').then((response)=>{
   resolve(response)
    })
    .catch((error)=>{
        reject(error)
    })
})

} 

// to get all data from wazrix
const getcoindata=async ()=>{
    return new Promise((resolve, reject) => {

        const replace = () => {
          const visited = new WeakSet();
          return (key, value) => {
            if (typeof value === 'object' && value !== null) {
              if (visited.has(value)) {
                return;
              }
              visited.add(value);
            }
            return value;
          };
        };
    
        axios
          .get('https://api.wazirx.com/sapi/v1/tickers/24hr')
          .then((response) => {
            resolve(JSON.stringify(response, replace()));
          })
          .catch((err) => {
             reject(err);
          });
      });
    };
    
    
    //Api for giving amount with respect to rupees
    router.get('/rate',async function(req,res){
        let  Code=req.query.currencyCode
        try{
            var rates = await getcode()
        }catch(error){
            res.status(500).json({err:error})
        }
        let  result=rates.data.rates[Code] || false
        if(result){
            res.status(200).json({result,currencyCode:Code})
        }else{
            res.status(400).json({message:'invalid currency'})
        }
    })
    
    //Api for bitcoin data based on the user provided currency code

    router.get('/bitdata',async (req,res)=>{
        let Code=req.query.currencyCode
        try {
            let response = await axios.get(`http://localhost:5000/api/rate/?currencyCode=${Code}`)
             var rate=response.data.result
            var currencyCode=response.data.currencyCode
             
        } catch (error) {
            res.json(error)
        }
        let bitc;
        await getcoindata()
          .then((response) => {
            const obj = JSON.parse(response);
            let data = obj.data;
      
            for (let i = 0; i < data.length; i++) {
              if (data[i].baseAsset == 'btc') {
                bitc = data[i];
                break;
              }
            }
            bitc.openPrice *=rate
            bitc.lowPrice *= rate
            bitc.highPrice *= rate
            bitc.lastPrice *= rate
            bitc.bidPrice *= rate
            bitc.askPrice *= rate
            bitc.quoteAsset=currencyCode
            
           res.json({bitc})
          })
          .catch((error) => {
             res.json({ errors: error });
          });
    })
    module.exports =router