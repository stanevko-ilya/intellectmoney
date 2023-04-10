const fetch = require('request-promise');
const sha256 = require('sha256');
const sha1 = require('sha1');
const convert = require('xml-js');

class IntellectMoney {
    #token;
    #secret_key_token;
    #secret_key_form;

    constructor (token='Токен для авторизации', secret_key_token='Секретный ключ доступа', secret_key_form='Секретная фраза для формы') {
        this.#token = token;
        this.#secret_key_token = secret_key_token;
        this.#secret_key_form = secret_key_form;
    }

    async getPaymentFormFields({ orderId=Date.now(), amount, formId, cardGuid='', comment='', backUrl='', language='ru' }) {
        const array = [ orderId, amount, formId, cardGuid, comment, backUrl, language ];
        const signHash = sha256(array.concat(this.#secret_key_token).join('::'));
        const data = { orderId, amount, formId, cardGuid, comment, backUrl, language };
        data.hash = sha1(array.concat(this.#secret_key_form).join('::'));

        return await IntellectMoney.request('GetFormUrl', data, signHash); // request.Response.Result.Url._text
    }

    async request(method, data, signHash) {
        let form = '';
        let counter = 0;
        for (const key in data) { form += `${counter++ === 0 ? '' : '&'}${key}=${data[key]}` }

        const request = await fetch.post(`https://api.intellectmoney.ru/p2p/${method}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.#token}`,
                'Sign': signHash,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: form,
        });
        
        return JSON.parse(convert.xml2json(request, { compact: true, spaces: 4 }));
    }
}

module.exports = IntellectMoney;
