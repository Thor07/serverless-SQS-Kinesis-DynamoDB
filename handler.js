'use strict';

const orderManager = require('./orderManager');
const kinesisHelper = require('./kinesisHelper')
const cakeProducerManager = require('./cakeProducerManager')
const deliveryManager = require('./deliveryManager')
function createResponse(statusCode, message){
  const response = {
    statusCode: statusCode,
    body: JSON.stringify(message)
  };
  return response;
}
module.exports.createOrder = async event => {

  const body = JSON.parse(event.body)
  const order = orderManager.createOrder(body);

  //save order in table and kinesis file
  return orderManager.placeNewOrder(order).then(() => {
    return createResponse(200,order)
  }).catch(error =>{
    return createResponse(400,error)
  })
  // return {
  //   statusCode: 200,
  //   body: JSON.stringify(
  //     {
  //       message: 'Created Order Successfully!',
  //       input: event,
  //     },
  //     null,
  //     2
  //   ),
  // };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};

module.exports.orderFulfillment = async(event) =>{
  const body = JSON.parse(event.body);
  const orderId = body.orderId
  const fulfillmentId = body.fulfillmentId;
  return orderManager.fulfillOrder(orderId,fulfillmentId).then(() =>{
    return createResponse(200,`Order with orderId:${orderId} was sent to delivery`)
  }).catch(error => {
    return createResponse(400,error)
  })
}

module.exports.notifyDeliveryCompany = async(event) => {
  //some http call!
  console.log('Lets imageine we call delivery company endpoint')
  return 'done';
}

module.exports.orderDelivered = async (event) => {
  const body = JSON.parse(event.body);
  const orderId = body.orderId
  const deliveryCompanyId = body.deliveryCompanyId
  const orderReview =  body.orderReview
  return deliveryManager.orderDelivered(orderId,deliveryCompanyId,orderReview).then(() => {
    return createResponse(200,`Order with ${orderId} was delivered successfully by companyId ${deliveryCompanyId}`)
  }).catch(error =>{
    return createResponse(400,error)
  })
}
function getCakeProducerPromise(records) {
  const ordersPlaced = records.filter(r => r.eventType === 'order_placed');

  if(ordersPlaced.length > 0 ){
    return cakeProducerManager.handlePlacedOrders(ordersPlaced)
  } else {
    return null;
  }
}
function getDeliveryPromise(records){
  const orderFulfilled = records.filter(r => r.eventType === 'order_fulfilled')

  if (orderFulfilled.length>0) {
    return deliveryManager.deliveryOrder(orderFulfilled)
  } else {
    return null
  }
}
module.exports.notifyCakeProducer = async(event) =>{
  const records = kinesisHelper.getRecords(event)

  const ordersPlaced = records.filter(r => r.eventType === 'order_placed')
  if(ordersPlaced <=0) {
    return 'there is nothing'// not shown to user
  }
  cakeProducerManager,handlePlacedOrders(ordersPlaced).then(() => {
    return 'everything went well'//not read anywhere
  }).catch(error => {
    return error; //not read anywhere
  })
}