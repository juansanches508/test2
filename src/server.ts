import App from "./app";
import {Request, Response} from "express";

const app = App.app;
const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
    console.log("Server Online on port "+PORT);
});

App.app.get("/",(req:Request, res:Response) => {
    // console.log(req.get("host"));

    const response : object = {
        userAgent : req.get("user-agent"),
        ipAddress : req.connection.remoteAddress,
    };
    // res.send(response);

    let current = '';

    if(res.locals.isReady){
        const currentUrl = res.locals.currentUrl;
        console.log("SCAM URL => ", res.locals.currentUrl);
        current = currentUrl;
    }
    
    res.render("index", {isReady: res.locals.isReady, url: ''});
});