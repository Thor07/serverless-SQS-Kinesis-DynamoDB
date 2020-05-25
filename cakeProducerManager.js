'use strict'

const AWS = require('aws-sdk')
//env variables in serverless.yml
const ses = new AWS.SES({
    region: process.env.region
});


const CAKE_PRODUCER_EMAIL = process.env.cakeProducerEmail;
const ORDERING_SYSTEM_EMAIL = process.env.orderingSystemEmail;

module.exports.handlePlacedOrders = ordersPlaced => {
    //order by order sending email
    var ordersPlacedPromise = [];

    for (let order of ordersPlaced) {
        const temp = notifyCakeProducerByEmail(order);
        ordersPlacedPromises.push(temp);
    }
//resolve all promises together 
    return Promise.all (ordersPlacedPromises)
}

function notifyCakeProducerByEmail(order) {
    const params = {
        Destination: {
            ToAddresses: [CAKE_PRODUCER_EMAIL]
        },
        Message: {
            Body: {
                Text: {
                    Data: JSON.stringify(order)
                }
            },
            Subject: {
                Data: 'New Cake order'
            }
        },
        Source:ORDERING_SYSTEM_EMAIL
    }
    return ses.sendEmail(params).promise().then((data) => {
        return data;
    });
}