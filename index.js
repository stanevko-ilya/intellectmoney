const config = require('../../config.json');
const fetch = require('request-promise');
const sha256 = require('sha256');
const sha1 = require('sha1');

class IntellectMoney {
    static async getPaymentFormFields({ orderId='', amount, formId=config.intellect_money.formId, cardGuid='', comment='', backUrl='', language='' }) {
        const array = [ orderId, amount.toFixed(2), formId, cardGuid, comment, backUrl, language ];
        const signHash = sha256(array.join('::'));
        const data = { orderId, amount, formId, cardGuid, comment, backUrl };
        data.hash = sha1(array.concat(config.intellect_money.secret_key).join('::'));

        return await IntellectMoney.request('GetFormUrl', data, signHash);
    }

    static async request(method, data, signHash) {
        let url = `https://api.intellectmoney.ru/p2p/${method}?`;
        let counter = 0;
        for (const key in data) { url += `${counter++ === 0 ? '' : '&'}${key}=${data[key]}` };
        
        const request = await fetch(
            url,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${config.intellect_money.token}`,
			        Sign: signHash  
                }
            }
        );
        return request.text();
    }
}

async function run() {
    console.log(await IntellectMoney.getPaymentFormFields({ amount: 400, comment: 'Test' }));
}
run();

module.exports = IntellectMoney;
