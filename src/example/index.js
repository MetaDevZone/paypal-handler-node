const {
  configurePaypal,
  createPaymentPlanOneTime,
  createPaymentPlanRecurring,
  createPaymentFixedRecurring,
  createPaymentInstallments,
  executePayment,
  billingAgreementExecute,
} = require("../paypal-handler");

// make function to intilize the paypal by calling configurePaypal function

const initializePaypal = async (mode, client_id, client_secret) => {
  try {
    let configuration = {
      mode: mode,
      client_id: client_id,
      client_secret: client_secret,
    };

    const { error, message, response } = await configurePaypal(configuration);
    if (error) {
      console.log(error);
      throw new Error(error);
    }

    return response;
  } catch (error) {
    return error;
  }
};

// createPaymentPlanOneTime function

const createOneTimePayment = async (
  paypal,
  amount,
  currency,
  discount_type,
  discount,
  tax,
  return_url
) => {
  try {
    let onetime_payment_obj = {
      amount: amount,
      currency: currency,
      discount_type: discount_type,
      discount: discount,
      tax: tax,
      return_url: return_url,
    };

    const { error, message, response } = await createPaymentPlanOneTime(
      onetime_payment_obj,
      paypal
    );
    if (error) {
      console.log(message);
      throw new Error(error);
    }
    return response;
  } catch (error) {
    return error;
  }
};

// createPaymentPlanRecurring function

const createRecurringPayment = async (
  paypal,
  amount,
  currency,
  discount_type,
  discount,
  tax,
  return_url,
  frequency,
  interval_count
) => {
  try {
    let recurring_payment_obj = {
      amount: amount,
      currency: currency,
      frequency: frequency,
      plan_name: "Recurring Payment Plan",
      trial_period_days: 0,
      return_url: return_url,
      discount_type: discount_type,
      discount: discount,
      tax: tax,
      custom_days: interval_count,
    };

    const { error, message, response } = await createPaymentPlanRecurring(
      recurring_payment_obj,
      paypal
    );

    if (error) {
      console.log(error);
      throw new Error(error);
    }

    return response;
  } catch (error) {
    return error;
  }
};

// createPaymentFixedRecurring function
const createFixedRecurringPayment = async (
  paypal,
  amount,
  currency,
  discount_type,
  discount,
  tax,
  return_url,
  frequency,
  interval_count
) => {
  try {
    let recurring_payment_obj = {
      amount: amount,
      currency: currency,
      frequency: frequency,
      plan_name: "Fixed Recurring Payment Plan",
      trial_period_days: 0,
      cycles: 1,
      return_url: return_url,
      discount_type: discount_type,
      discount: discount,
      tax: tax,
      custom_days: interval_count,
    };

    const { error, message, response } = await createPaymentFixedRecurring(
      recurring_payment_obj,
      paypal
    );

    if (error) {
      console.log(error);
      throw new Error(error);
    }

    return response;
  } catch (error) {
    return error;
  }
};

// createPaymentInstallments function

const createInstallmentsPayment = async (
  paypal,
  amount,
  initial_amount,
  currency,
  discount_type,
  discount,
  tax,
  return_url,
  frequency,
  interval_count
) => {
  try {
    let installments_payment_obj = {
      amount: amount,
      initial_amount: initial_amount,
      currency: currency,
      frequency: frequency,
      plan_name: "Installments Payment Plan",
      trial_period_days: 0,
      cycles: 1,
      return_url: return_url,
      discount_type: discount_type,
      discount: discount,
      tax: tax,
      custom_days: interval_count,
    };

    const { error, message, response } = await createPaymentInstallments(
      installments_payment_obj,
      paypal
    );

    if (error) {
      console.log(error);
      throw new Error(error);
    }

    return response;
  } catch (error) {
    return error;
  }
};

// executePayment function
const executePaymentFunction = async (paypal, payment_id, payer_id) => {
  try {
    let execute_payment_obj = {
      payment_id: payment_id,
      payer_id: payer_id,
    };

    const { error, message, response } = await executePayment(
      execute_payment_obj,
      paypal
    );

    if (error) {
      console.log(error);
      throw new Error(error);
    }

    return response;
  } catch (error) {
    return error;
  }
};

// billingAgreementExecute function
const billingAgreementExecuteFunction = async (paypal, token) => {
  try {
    let billing_agreement_execute_obj = {
      token: token,
    };

    const { error, message, response } = await billingAgreementExecute(
      billing_agreement_execute_obj,
      paypal
    );

    if (error) {
      console.log(error);
      throw new Error(error);
    }

    return response;
  } catch (error) {
    return error;
  }
};

initializePaypal(
  "sandbox",
  "Ab7eQJhhXmUGhsQEXgIMy0lh1hu_Cg8cHhk3d35I3lzD-7u67o5AGPD4aDYAUMULsOcPqFazzqMKqKHs",
  "EMgvpBj6K0dsuBJiD4K6jWHiGtSm-IzWedu2W2Mqkpt4l85U3jfaBylGcCf8m2bIk40TSRb158rgCOwe"
)
  .then((response) => {
    // make one time payment
    // createOneTimePayment(
    //   response,
    //   100,
    //   "usd",
    //   "percentage",
    //   0,
    //   0,
    //   "https://www.example.com"
    // )
    //   .then((response) => {
    //     console.log(response.payment.transactions);
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //   });
    executePaymentFunction(
      response,
      "PAYID-M5P67EQ5T198344DY3965633",
      "UKGW35S8C674S"
    )
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  })
  .catch((error) => {
    console.log(error);
  });
