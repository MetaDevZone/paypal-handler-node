const {
  configurePaypal,
  createPaymentPlanOneTime,
  createPaymentPlanRecurring,
  createPaymentFixedRecurring,
  createPaymentInstallments,
  executePayment,
  billingAgreementExecute,
  cancelPaypalSubscription,
  getLatestSaleId,
  refundPaypalPayment,
} = require("./src/paypal-handler");

module.exports = {
  configurePaypal,
  createPaymentPlanOneTime,
  createPaymentPlanRecurring,
  createPaymentFixedRecurring,
  createPaymentInstallments,
  executePayment,
  billingAgreementExecute,
  getLatestSaleId,
  refundPaypalPayment,
  cancelPaypalSubscription,
};
