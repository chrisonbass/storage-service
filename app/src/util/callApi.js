import http from 'http';

export default async function callApi(url, options) {
    let requestBody;
    let userRequestOptions = {};
    let requestHeaders;
    if (options && options.body) {
        const {body, ...otherOptions} = options;
        requestBody = body;
        userRequestOptions = otherOptions;
    }
    if (options && options.headers) {
        const {headers, ...otherOptions} = options;
        requestHeaders = headers;
        userRequestOptions = {
            ...userRequestOptions,
            otherOptions
        };
        if (userRequestOptions.body) {
            delete userRequestOptions.body;
        }
    }
    const requestUrl = new URL(url);
    return new Promise((resolve, reject) => {
        const path = requestUrl.search ? `${requestUrl.pathname}${requestUrl.search}` : requestUrl.pathname;
        const requestOptions = {
           host: requestUrl.hostname,
           path,
           port: requestUrl.port,
           ...userRequestOptions 
        };
        const request = http.request(requestOptions, (res) => {
            let data = '';
            res.on('data', (line) => {
                data += line;
            });
            res.on('end', () => {
                const status = res.statusCode;
                let parsedData = '';
                if (data && data.trim()) {
                    try {
                        parsedData = JSON.parse(data.trim());
                    } catch (e) {
                        parsedData = data.trim();
                    }
                } 
                if (status >= 200 && status < 400) {
                    resolve(parsedData);
                } else {
                    reject(parsedData);
                }
            });
        });
        request.on('error', (err) => {
            reject(err);
        });
        if (requestHeaders && Object.keys(requestHeaders).length) {
            Object.keys(requestHeaders).forEach((header) => {
                request.setHeader(header.toLowerCase(), requestHeaders[header]);
            });
        }
        if (requestBody) {
            const data = new TextEncoder().encode(JSON.stringify(requestBody));             
            request.setHeader('Content-Type', 'application/json');
            request.setHeader('Content-Length', data.length);
            request.write(data, () => {
                request.end();
            });
        } else {
            request.end();
        }
    });
}