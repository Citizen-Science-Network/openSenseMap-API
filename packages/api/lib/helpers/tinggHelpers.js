'use strict';
const fetch = require('node-fetch');
const app = {
    TINGG_URL: 'https://api.stage01a.tingg.io/v1/'

}
let access_token;

/**
 * inits tingg registration process 
 * 0. login (name,password)
 * 1. createThingType (name,sensors, )
 * 2. createThing ( name, thingtypeid)
 * 3. linkModem (imsi,thingid)
 */
const initTingg = async function newbox(box) {
    if (!access_token) {
        access_token = await login({ "email": app.email, "password": app.password })
    }
    try {
        const thing_type_id = await createThingType(box);
        const thing_id = await createThing(box.name, thing_type_id);
        // linkModem(box.tingg.gsm,thing_id)
        return true;
    }
    catch (error) {
        console.error(error)
    }
}


/**
 * logs into tingg developer account
 * @param {"email":"email","password":"password"} data 
 */
const login = async function login(data) {
    console.log("new loign")
    try {
        let response = await fetch(app.TINGG_URL + 'auth/login', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" }
        })
        if (!response.ok) {
            throw new Error(`HTTP Error status : ${response.status}`)
        }
        response = await response.json();
        return response.token;
    } catch (error) {
        console.log(error);
    }
}
/**
 * gets new token based on old one
 * @param token: String
 */
const refreshToken = async function refreshToken() {
    try {
        let response = await fetch(app.TINGG_URL + 'auth/token-refresh', {
            method: 'POST',
            headers: { "Authorization": "Bearer " + access_token ,"Content-Type": "application/json" },
        })
        if (!response.ok) {
            if(response.status === 401){
                let new_access_token = await login({ "email": app.email, "password": app.password })
                return new_access_token;
            }
            throw new Error(`HTTP Error status at refresh token : ${response.status}`)
        }
        response = await response.json();
        return response.token;
    } catch (error) {
        console.log(error);
    }

}
/*
    calls POST https://api.tingg.io/v1/thing-types to create thing types 
    should be called right after verifyModem()
    input: sensors, box , name (look pdf for body example)
    output: thing_type_id
*/
const createThingType = async function createThingType(data) {
    try {
        const thingtypebody = buildBody(data);
        const headers =  { "Authorization": "Bearer " + access_token, "Content-Type": "application/json" }
        let response = await fetch(app.TINGG_URL + '/thing-types', {
            method: 'POST',
            body: JSON.stringify(thingtypebody),
            headers
        })
        if (!response.ok) {
            if (response.status === 401) {
                console.log("Unauthorized");
                access_token = await refreshToken();
                createThingType(data);
            }
            if (response.status === 400) {
                console.log("Invalid Input");
                throw new Error('Invalid Input');
            }
            else {
           throw new Error(`HTTP Error status : ${response.headers}`)
            }
        }
        response = await response.json();
        let thing_type_id = response.id;
        return thing_type_id;

    } catch (error) {
        console.log(error);
    }

}

/*
    calls POST https://api.tingg.io/v1/things to create a thing
    input: thing_type_id from previous request
    output: thing_id

    data = {
    "name": "Some name, maybe senseBoxId",
    "thing_type_id": "80fe09c5-bd02-43b7-9947-ea6ad458181b"
    }

*/

const createThing = async function createThing(name, thingid) {
    try {
        const body = { "name": name, "thing_type_id": thingid }
        let response = await fetch(app.TINGG_URL + '/things', {
            method: 'POST',
            body: JSON.stringify(body),
            headers: { "Authorization": "Bearer " + access_token, "Content-Type": "application/json" }
        })
        if (!response.ok) {
            if (response.status === 401) {
                console.log("Unauthorized");
                access_token = await refreshToken(access_token);
                createThing(name, thingid);
            }
            if (response.status === 400) {
                console.log("Invalid Input");
                throw new Error('Invalid Input');
            }

        }
        response = await response.json();
        return response;
    } catch (error) {
        console.log(error);
    }

}

/*
    calls POST https://api.tingg.io/v1/modems/:imsi/link to verify modem and thing id 
    input: imsi and thing_id 
    output:200/400 status code 
*/
const linkModem = async function linkModem(imsi, thing_id) {
    try {
        let response = await fetch(app.TINGG_URL + '/modems/' + imsi + '/link', {
            method: 'POST',
            body: thing_id,
            headers: { "Authorization": "Bearer " + access_token }
        })
        if (!response.ok) {
            if (response.status === 401) {
                console.log("Unauthorized");
                access_token = await refreshToken(access_token);
                linkModem(imsi, thing_id);
            }
            if (response.status === 400) {
                console.log("Invalid Input");
                throw new Error('Invalid Input');
            }
        }
        response = await response.json();
        return response;
    } catch (error) {
        console.log(error);
    }

}

/**Helper function to build the data accordingly from the sensor array
 *  needs name and box id
 * @param {sensor array from registration} data 
 */
const buildBody = function buildBody(data) {
    let resources = []
    if (data.sensors) {
        data.sensors.map((sensor) => {
            let toAdd = {
                "topic": `/osm/${data._id}/${sensor._id}`,
                "method": "pub",
                "type": "object"
            }
            resources.push(toAdd);
        })
    }
    let body = {
        "name": data._id,
        "description": "Some basic description",
        "resources": resources
    }
    return body;
}


module.exports = {
    login,
    refreshToken,
    createThingType,
    createThing,
    linkModem,
    access_token,
    initTingg
}