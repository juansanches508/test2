import App from "./app";
import {Request, Response} from "express";

const app = App.app;
const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
    console.log("Server Online on port "+PORT);
});

/* =============== GITHUB ===============
username: juansanches5084Z
====================================== */

App.app.get("/",(req:Request, res:Response) => {
    const response : object = {
        userAgent : req.get("user-agent"),
        ipAddress : req.connection.remoteAddress,
    };

    let current = '';
    if(res.locals.isReady){
        const currentUrl = res.locals.currentUrl;
        current = currentUrl;
    }
    
    res.render("index", {isReady: res.locals.isReady, url: current});
});