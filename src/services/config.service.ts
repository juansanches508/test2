import config from "config"
import * as type from '../types/generic.type';

export class ConfigService{

    constructor(){}

    checkIfAllowedCountry(current: string): type.AllowOrDeny{
        try {
            const allowCountrys: string[] = config.get('paises_permitidos');
            for (const country of allowCountrys) {
                if(current.toUpperCase() === country){
                    return {isOk: true, isError: false, message: ''};
                }
            }
            return {isOk: false, isError: false, message: ''};
        } catch (e) {
            const error : string = (e as Error).message;
            return {isOk: false, isError: true, message: 'checkIfAllowedCountry() => '+error};
        }
    }

    checkIfDeniedIps(current: string): type.AllowOrDeny{
        try {
            const deniedIps: string[] = config.get('bloqueador_ips');
            if (deniedIps.includes(current)) {
                return {isOk: true, isError: false, message: ''};
            }
            return {isOk: false, isError: false, message: ''};
            // for (const ip of deniedIps) {
            //     if(current === ip){
            //         return {isOk: true, isError: false,, message: ''};
            //     }
            // }
            // return {isOk: false, isError: false,, message: ''};
        } catch (e) {
            const error : string = (e as Error).message;
            return {isOk: false, isError: true, message: 'checkIfDeniedIps() => '+error};
        }
    }

    getScamByParams(current: string): type.GetStr{
        try {
            const identificadores: string[] = config.get('identificadores');
            for (const param of identificadores) {
                if(param.indexOf(current) !== -1){
                    const url = param.split('?')[1];
                    return {url: url, isError: false, message: ''};
                }
            }
            return {url: '', isError: false, message: ''};
        } catch (e) {
            const error : string = (e as Error).message;
            return {url: '', isError: true, message: 'getScamByParams() => '+error};
        }
    }

    getBypassUrl(): type.GetStr{
        try {
            const byPassUrl: string = config.get('url_desvio');
            return {url: byPassUrl, isError: false, message: ''};
        } catch (e) {
            const error : string = (e as Error).message;
            return {url: '', isError: true, message: 'getBypassUrl() => '+error};
        }
    }

}