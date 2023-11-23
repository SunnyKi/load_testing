import http from 'k6/http';
import { check } from 'k6';
import { Trend } from 'k6/metrics';
import { randomString, randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

export let options = {
    thresholds: {
        http_req_failed: [
            {
                threshold: 'rate<0.01',
                abortOnFail: true,
                delayAbortEval: '10s',
            },
        ],
        http_req_duration: [
            {
                threshold: 'p(95)<500',
                abortOnFail: true,
                delayAbortEval: '10s',
            },
        ], 
    },
    discardResponseBodies: true,
    scenarios: {
        ramping_arrival: {
            executor: 'ramping-arrival-rate',
            startRate: 0,
            timeUnit: '1s',
            preAllocatedVUs: 600,
            stages: [
                { duration: '15m',  target: 12 },
                { duration: '60m',  target: 12 },
                { duration: '10m',   target: 0 },
            ],
        },
    // ramping: {
    //         executor: 'ramping-vus',
    //         stages: [
    //             { duration: '15000s', target: 500 },
    //             { duration: '5m', target: 501},
    //             { duration: '5m', target: 0 },
    //         ],
    //     },
    },
};

const Cities                = 'http://91.185.85.213/Cities/';
const Forecast              = 'http://91.185.85.213/Forecast/';
const WeatherForecast       = 'http://91.185.85.213/WeatherForecast/';
const paramsGet             = { headers: {'Host': 'web-api','accept': 'text/plain'},};
const paramsPutPost         = { headers: {'Host': 'web-api','accept': '*/*','Content-Type': 'application/json'},};
const uptimeTrendCities     = new Trend('GET_Cities');
const uptimeTrendForecas    = new Trend('GET_Forecast');
const uptimeTrendWeatherForecast    = new Trend('GET_WeatherForecast');

export default function () {
    let response;
    for (let i = 0; i < 20; i++) {
        response = http.get(Cities, paramsGet);
        uptimeTrendCities.add(response.timings.duration);
        check(response, {
            "status code should be 200": res => res.status === 200,
        });
        // console.log(JSON.stringify(response.body));
        // const jsonCities = JSON.parse(response.body);
        // const citiesId = jsonCities[randomIntBetween(0, (jsonCities.length - 1))].id;
        // console.log(citiesId);
        // for (let i = 0; i < jsonCities.length; i++) {
        //     if (jsonCities[i].id == citiesId) {
        //         console.log(jsonCities[i]);
        //     };
        // };
        response = http.get(Forecast, paramsGet);
        uptimeTrendForecas.add(response.timings.duration);
        check(response, {
            "status code should be 200": res => res.status === 200,
        });
        // console.log(JSON.stringify(response.body));
        // const jsonForecast = JSON.parse(response.body);
        // for (let i = 0; i < jsonForecast.length; i++) {
        //     if (jsonForecast[i].cityId == citiesId) {
        //         console.log(jsonForecast[i]);
        //     };
        // };
    };
    response = http.get(WeatherForecast, paramsGet);
    uptimeTrendWeatherForecast.add(response.timings.duration);
    check(response, {
        "status code should be 200": res => res.status === 200,
    });
};

export function handleSummary(data) {
    return {
      "summary.html": htmlReport(data),
       stdout: textSummary(data, { indent: " ", enableColors: true }),
    };
};