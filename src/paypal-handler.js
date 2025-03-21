const paypal = require("paypal-rest-sdk");

const {
  validateConfigurePaypal,
  validateOneTimePaymentPlan,
  validateRecurringPaymentPlan,
  validateFixedRecurringPayment,
  validateInstallmentsPayment,
  validateExecutePayment,
  validateBillingAgreementExecute,
} = require("../validation/paypal");
const { GET_DISCOUNTED_AMOUNTS } = require("./helpers/general_helpers");

/**
 *
 * @param {
 * mode: "sandbox" | "live",
 * client_id: string,
 * client_secret: string
 * } body
 *
 * @description This function is used to configure the paypal sdk with the given credentials
 * @returns
 */
/************************************************** Configure PayPal ******************************** */
const configurePaypal = async (body) => {
  let { error, message } = validateConfigurePaypal(body);
  if (error) {
    return { error: true, message: message, response: null };
  }
  try {
    paypal.configure({
      mode: body.mode ?? "sandbox", // 'sandbox' or 'live'
      client_id: body.client_id,
      client_secret: body.client_secret,
    });
    return { error: false, message: "", response: paypal };
  } catch (error) {
    return { error: true, message: error.message, response: null };
  }
};
/*****************************************************************************************************/
/**
  @param {
    amount: number,
    currency: string,
    discount_type: string,
    discount: number,
    tax: number,
    return_url: string
  } body

  @description This function is used to create a one-time payment link
  @returns  { error: boolean, message: string, response: 
    { payment: object, link: string } | null }
 */
/************************************************ Create One Time Payment Plan ******************************/
const createPaymentPlanOneTime = (body, paypal) => {
  //validate the body with joi
  let { error, message } = validateOneTimePaymentPlan(body);
  if (error) {
    return { error: true, message: message, response: null };
  }
  body.currency = body.currency.toUpperCase();
  if (body.discount > 0) {
    if (body.discount_type == "percentage") {
      let discount_amount = (body.discount / 100) * body.amount;
      body.amount = (body.amount - discount_amount).toFixed(1);
      body.amount = parseFloat(body.amount);
    } else {
      body.amount = (body.amount - body.discount).toFixed(1);
      body.amount = parseFloat(body.amount);
    }
  }
  if (body.tax > 0) {
    tax = body.amount * (body.tax / 100);
    body.amount = tax + body.amount;
  }
  return new Promise((resolve) => {
    const create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: body.return_url,
        cancel_url: body.cancel_url,
      },
      transactions: [
        {
          item_list: {
            items: [
              {
                name: "item",
                sku: "item",
                price: body.amount,
                currency: body.currency,
                quantity: 1,
              },
            ],
          },
          amount: {
            currency: body.currency,
            total: body.amount,
            details: {
              subtotal: body.amount,
              tax: "0.00", // Include tax if applicable
              shipping: "0.00", // Include shipping if applicable
            },
          },
          description: body.description,
        },
      ],
    };

    paypal.payment.create(create_payment_json, (error, payment) => {
      if (error) {
        console.log(error, "error in one-time PayPal payment..............");
        resolve({
          error: true,
          message: error.response
            ? error.response.details
            : "Could not make payment",
          response: null,
        });
      } else {
        let link = "";
        console.log("Create Payment Response", payment);
        for (let i = 0; i < payment.links.length; i++) {
          if (payment.links[i].rel == "approval_url") {
            link = payment.links[i];
          }
        }
        resolve({ error: false, message: "", response: { payment, link } });
      }
    });
  });
};
/***********************************************************************************************************/
/**
 * @param {
 * amount: number,
 * currency: string,
 * frequency: string,
 * plan_name: string,
 * trial_period_days: number,
 * return_url: string,
 * discount_type: string,
 * discount: number,
 * tax: number,
 * custom_days: number
 * } body
 *
 * @description This function is used to create a recurring payment plan
 * @returns { error: boolean, message: string, response:
 * { billingAgreement: object, link: string } | null }
 *
 */

const createPaymentPlanRecurring = async (body, paypal) => {
  //validate the body with joi
  let { error, message } = validateRecurringPaymentPlan(body);
  if (error) {
    return { error: true, message: message, response: null };
  }
  let link = "";
  body.currency = body.currency.toUpperCase();
  if (body.discount > 0) {
    if (body.discount_type == "percentage") {
      let discount_amount = (body.discount / 100) * body.amount;
      body.amount = (body.amount - discount_amount).toFixed(1);
      body.amount = parseFloat(body.amount);
    } else {
      body.amount = (body.amount - body.discount).toFixed(1);
      body.amount = parseFloat(body.amount);
    }
  }
  if (body.tax > 0) {
    tax = body.amount * (body.tax / 100);
    body.amount = tax + body.amount;
  }

  let custom_days = 1;
  if (body.frequency == "custom") {
    body.frequency = "DAY";
    custom_days = body.custom_days;
  }
  return new Promise(async (resolve) => {
    try {
      let UppercaseFrequency = body.frequency.toUpperCase();

      let payment_def = [
        {
          name: "Regular Payments",
          type: "REGULAR",
          frequency: UppercaseFrequency,
          frequency_interval: String(custom_days),
          cycles: "0",
          amount: {
            currency: body.currency,
            value: body.amount,
          },
        },
      ];
      // in case of trial period
      if (body.trial_period_days > 0) {
        payment_def.unshift({
          // Use unshift to place the trial period first
          name: "Trial Period",
          type: "TRIAL",
          frequency: "DAY",
          frequency_interval: "1",
          cycles: body.trial_period_days.toString(), // Convert trial period days to string
          amount: {
            currency: body.currency,
            value: "0.00", // Free trial
          },
        });
      }
      // Define the payment plan
      const create_payment_json = {
        name: body.plan_name,
        description: "Monthly subscription",
        type: "INFINITE",
        payment_definitions: payment_def,
        merchant_preferences: {
          setup_fee: {
            currency: body.currency,
            value: "0.00",
          },
          cancel_url: body.cancel_url,
          return_url: body.return_url,
          max_fail_attempts: "1",
          auto_bill_amount: "YES",
          initial_fail_amount_action: "CONTINUE",
        },
      };

      // Create the payment plan
      const payment = await new Promise((resolve, reject) => {
        paypal.billingPlan.create(create_payment_json, (error, payment) => {
          if (error) {
            reject(
              error.response ? error.response.details : "Could not make payment"
            );
          } else {
            resolve(payment);
          }
        });
      });

      // Activate the payment plan
      const billing_plan_update_attributes = [
        {
          op: "replace",
          path: "/",
          value: {
            state: "ACTIVE",
          },
        },
      ];

      await new Promise((resolve, reject) => {
        paypal.billingPlan.update(
          payment.id,
          billing_plan_update_attributes,
          (error) => {
            if (error) {
              reject(error);
            } else {
              resolve();
            }
          }
        );
      });

      let start_date = new Date(Date.now() + 60000).toISOString();
      if (body.start_date) {
        start_date = body.start_date;
      }

      // Define the billing agreement
      const billing_agreement_attributes = {
        name: "Recurring Agreement Name",
        description: "Recurring Agreement Description",
        start_date: start_date, // Start date of the agreement
        plan: {
          id: payment.id,
        },
        payer: {
          payment_method: "paypal",
        },
      };

      // Create the billing agreement
      const billingAgreement = await new Promise((resolve, reject) => {
        paypal.billingAgreement.create(
          billing_agreement_attributes,
          (error, billingAgreement) => {
            if (error) {
              reject(
                error.response
                  ? error.response.details
                  : "Could not create billing agreement"
              );
            } else {
              resolve(billingAgreement);
            }
          }
        );
      });
      for (let i = 0; i < billingAgreement.links.length; i++) {
        if (billingAgreement.links[i].rel == "approval_url") {
          link = billingAgreement.links[i];
        }
      }
      // Resolve the billing agreement
      resolve({
        error: false,
        message: "",
        response: { billingAgreement, link },
      });
    } catch (error) {
      resolve({ error: true, message: error.message, response: null });
    }
  });
};

/**
 * @param {
 * amount: number,
 * currency: string,
 * frequency: string,
 * plan_name: string,
 * trial_period_days: number,
 * cycles: number,
 * return_url: string,
 * discount_type: string,
 * discount: number,
 * tax: number,
 * custom_days: number
 * } body
 *
 * @description This function is used to create a fixed recurring payment plan
 * @returns { error: boolean, message: string, response:
 * { billingAgreement: object, link: string } | null }
 * */

const createPaymentFixedRecurring = async (body, paypal) => {
  //validate the body with joi
  let { error, message } = validateFixedRecurringPayment(body);
  if (error) {
    return { error: true, message: message, response: null };
  }
  let link = "";
  body.currency = body.currency.toUpperCase();
  if (body.discount > 0) {
    if (body.discount_type == "percentage") {
      let discount_amount = (body.discount / 100) * body.amount;
      body.amount = (body.amount - discount_amount).toFixed(1);
      body.amount = parseFloat(body.amount);
    } else {
      body.amount = (body.amount - body.discount).toFixed(1);
      body.amount = parseFloat(body.amount);
    }
  }
  if (body.tax > 0) {
    tax = body.amount * (body.tax / 100);
    body.amount = tax + body.amount;
  }
  if (body.cycles > 0) {
    body.amount = body.amount / body.cycles;
  }

  let custom_days = 1;
  if (body.frequency == "custom") {
    body.frequency = "DAY";
    custom_days = body.custom_days;
  }

  return new Promise(async (resolve) => {
    try {
      let UppercaseFrequency = body.frequency.toUpperCase();
      let payment_def = [
        {
          name: "Regular Payments",
          type: "REGULAR",
          frequency: UppercaseFrequency,
          frequency_interval: String(custom_days),
          cycles: body.cycles,
          amount: {
            currency: body.currency,
            value: body.amount,
          },
        },
      ];
      // in case of trial period
      if (body.trial_period_days > 0) {
        payment_def.unshift({
          // Use unshift to place the trial period first
          name: "Trial Period",
          type: "TRIAL",
          frequency: "DAY",
          frequency_interval: "1",
          cycles: body.trial_period_days.toString(), // Convert trial period days to string
          amount: {
            currency: body.currency,
            value: "0.00", // Free trial
          },
        });
      }

      const create_payment_json = {
        name: body.plan_name,
        description: "Monthly subscription plan description",
        type: "FIXED",
        payment_definitions: payment_def,
        merchant_preferences: {
          setup_fee: {
            currency: body.currency,
            value: "0.00",
          },
          cancel_url: body.return_url,
          return_url: body.return_url,
          max_fail_attempts: "1",
          auto_bill_amount: "YES",
          initial_fail_amount_action: "CONTINUE",
        },
      };

      const payment = await new Promise((resolve, reject) => {
        paypal.billingPlan.create(create_payment_json, (error, payment) => {
          if (error) {
            reject(
              error.response ? error.response.details : "Could not make payment"
            );
          } else {
            resolve(payment);
          }
        });
      });

      const billing_plan_update_attributes = [
        {
          op: "replace",
          path: "/",
          value: {
            state: "ACTIVE", // Activate the billing plan
          },
        },
      ];

      await new Promise((resolve, reject) => {
        paypal.billingPlan.update(
          payment.id,
          billing_plan_update_attributes,
          (error) => {
            if (error) {
              reject(error);
            } else {
              resolve();
            }
          }
        );
      });

      let start_date = new Date(Date.now() + 60000).toISOString();
      if (body.start_date) {
        start_date = body.start_date;
      }

      const billing_agreement_attributes = {
        name: "Recurring Agreement Name",
        description: "Recurring Agreement Description",
        start_date: start_date, // Start date of the agreement (1 minute in the future)
        plan: {
          id: payment.id,
        },
        payer: {
          payment_method: "paypal",
        },
      };

      const billingAgreement = await new Promise((resolve, reject) => {
        paypal.billingAgreement.create(
          billing_agreement_attributes,
          (error, billingAgreement) => {
            if (error) {
              reject(
                error.response
                  ? error.response.details
                  : "Could not create billing agreement"
              );
            } else {
              resolve(billingAgreement);
            }
          }
        );
      });
      for (let i = 0; i < billingAgreement.links.length; i++) {
        if (billingAgreement.links[i].rel == "approval_url") {
          link = billingAgreement.links[i];
        }
      }
      resolve({
        error: false,
        message: "",
        response: { billingAgreement, link },
      });
    } catch (error) {
      resolve({ error: true, message: error.message, response: null });
    }
  });
};
/********************************************* Create Installments Payment Plan ******************************/
const createPaymentInstallments = async (body, paypal) => {
  let { error, message } = validateInstallmentsPayment(body);
  if (error) {
    console.log(error);
    return { error: true, message: message, response: null };
  }
  body.currency = body.currency.toUpperCase();
  // Apply Discount ...
  if (body.discount > 0) {
    const { discounted_initial_amount, discounted_installment_amount } =
      GET_DISCOUNTED_AMOUNTS(
        body.discount,
        body.discount_type,
        body.initial_amount,
        body.amount
      );
    body.initial_amount = discounted_initial_amount;
    body.amount = discounted_installment_amount;
  }

  // Apply Tax ...
  let tax = 0;
  if (body.tax > 0) {
    tax = body.amount * (body.tax / 100);
    body.amount = tax + body.amount;
    body.amount = body.amount.toFixed(2);
    tax = body.initial_amount * (body.tax / 100);
    body.initial_amount = tax + body.initial_amount;
    body.initial_amount = body.initial_amount.toFixed(2);
  }

  if (body.cycles > 0) {
    body.amount = body.amount / body.cycles;
    body.amount = body.amount.toFixed(2);
  }
  let custom_days = 1;
  if (body.frequency === "custom") {
    body.frequency = "DAY";
    custom_days = body.custom_days;
  }

  return new Promise(async (resolve) => {
    try {
      const UppercaseFrequency = body.frequency.toUpperCase();
      const payment_definitions = [];

      // Conditionally add a TRIAL phase if trial_period_days > 0
      if (body.trial_period_days > 0) {
        payment_definitions.push({
          name: body.plan_name + " Trial Period",
          type: "TRIAL",
          frequency: "DAY",
          frequency_interval: "1",
          cycles: body.trial_period_days.toString(), // Number of days for trial
          amount: {
            currency: body.currency,
            value: "0.00", // No charge during the trial period
          },
        });
      }

      // Add the REGULAR phase for the initial payment
      payment_definitions.push({
        name:
          body.plan_name +
          (body.trial_period_days > 0
            ? " Initial Charge"
            : " Regular Payments"),
        type: "REGULAR",
        frequency: UppercaseFrequency,
        frequency_interval: String(custom_days), // Number of days for each billing cycle
        cycles: body.cycles.toString(), // Number of regular payments
        amount: {
          currency: body.currency,
          value: body.amount, // Regular payment amount
        },
      });
      const create_payment_json = {
        name: body.plan_name,
        description:
          body.trial_period_days > 0
            ? "Subscription plan with trial, initial, and recurring payments"
            : "Plan with initial payment and recurring payments",
        type: "FIXED",
        payment_definitions: payment_definitions,
        merchant_preferences: {
          setup_fee: {
            currency: body.currency,
            value: body.initial_amount, // Charge the setup fee immediately
          },
          cancel_url: body.cancel_url ? body.cancel_url : body.return_url,
          return_url: body.return_url,
          max_fail_attempts: "1",
          auto_bill_amount: "YES",
          initial_fail_amount_action: "CONTINUE",
        },
      };
      // Create the payment plan
      const payment = await new Promise((resolve, reject) => {
        paypal.billingPlan.create(create_payment_json, (error, payment) => {
          if (error) {
            console.log(
              JSON.stringify(error, null, 2),
              "error in creating payment plan.............."
            );
            reject(
              error.response
                ? error.response.details
                : "Could not create payment plan"
            );
          } else {
            resolve(payment);
          }
        });
      });
      // Activate the payment plan
      const billing_plan_update_attributes = [
        {
          op: "replace",
          path: "/",
          value: {
            state: "ACTIVE", // Activate the billing plan
          },
        },
      ];

      await new Promise((resolve, reject) => {
        paypal.billingPlan.update(
          payment.id,
          billing_plan_update_attributes,
          (error) => {
            if (error) {
              reject(error);
            } else {
              resolve();
            }
          }
        );
      });
      // Calculate the start date for recurring payments (1 day after the initial payment)
      const now = new Date();
      const oneDayInMillis = 24 * 60 * 60 * 1000;
      let startDate = new Date(now.getTime() + oneDayInMillis).toISOString();
      if (body.start_date) {
        startDate = body.start_date;
      }

      // Create the billing agreement
      const billing_agreement_attributes = {
        name: body.plan_name + " Agreement",
        description:
          body.trial_period_days > 0
            ? "Agreement for trial and recurring payments"
            : "Agreement with initial payment and recurring payments",
        start_date: startDate, // Start the recurring payments 1 day after the initial payment
        plan: {
          id: payment.id,
        },
        payer: {
          payment_method: "paypal",
        },
      };

      const billingAgreement = await new Promise((resolve, reject) => {
        paypal.billingAgreement.create(
          billing_agreement_attributes,
          (error, billingAgreement) => {
            if (error) {
              reject(
                error.response
                  ? error.response.details
                  : "Could not create billing agreement"
              );
            } else {
              resolve(billingAgreement);
            }
          }
        );
      });

      let link = "";
      for (let i = 0; i < billingAgreement.links.length; i++) {
        if (billingAgreement.links[i].rel == "approval_url") {
          link = billingAgreement.links[i];
        }
      }
      resolve({
        error: false,
        message: "Sucessfully created billing agreement",
        response: { billingAgreement, link },
      }); // Return the billing agreement
    } catch (error) {
      resolve({ error: true, message: error.message, response: null });
    }
  });
};
/**************************************************************************************************************/
// Execute the payment
let executePayment = async (body, paypal) => {
  //validate the body with joi
  let { error, message } = validateExecutePayment(body);
  if (error) {
    return { error: true, message: message, response: null };
  }
  try {
    let execute_payment_json = {
      payer_id: body.payer_id,
    };
    const payment = await new Promise((resolve, reject) => {
      paypal.payment.execute(
        body.payment_id,
        execute_payment_json,
        (error, payment) => {
          if (error) {
            console.log(
              error,
              "error in one-time PayPal payment.............."
            );
            reject(error);
          } else {
            resolve(payment);
          }
        }
      );
    });
    return { error: false, message: "", response: payment };
  } catch (error) {
    return { error: true, message: error.message, response: null };
  }
};

let billingAgreementExecute = async (body, paypal) => {
  //validate the body with joi
  let { error, message } = validateBillingAgreementExecute(body);
  if (error) {
    return { error: true, message: message, response: null };
  }
  try {
    const billing_agreement_execute_res = await new Promise(
      (resolve, reject) => {
        paypal.billingAgreement.execute(
          body.token,
          (error, billing_agreement_execute_res) => {
            if (error) {
              console.log(
                error,
                "error in executing recurring payment........"
              );
              reject(error);
            } else {
              if (body.trial_period_days > 0) {
                // Handle trial period logic here if needed
              }
              resolve(billing_agreement_execute_res);
            }
          }
        );
      }
    );
    return {
      error: false,
      message: "",
      response: billing_agreement_execute_res,
    };
  } catch (error) {
    return { error: true, message: error.message, response: null };
  }
};
/**************************************************************************************************************/
// Cancel the subscription

const cancelPaypalSubscription = async (subscriptionId, paypal) => {
  return new Promise((resolve, reject) => {
    paypal.billingAgreement.cancel(
      subscriptionId,
      { note: "User requested cancellation" },
      (error, response) => {
        if (error) {
          console.log("Error canceling subscription:", error);
          reject(error);
        } else {
          resolve({
            error: false,
            message: "Subscription canceled successfully",
            response,
          });
        }
      }
    );
  });
};

const getLatestSaleId = async (subscriptionId, paypal) => {
  const startDate = "2020-01-01"; // Adjust date range if needed
  const endDate = "2099-12-31";

  return new Promise((resolve, reject) => {
    paypal.billingAgreement.searchTransactions(
      subscriptionId,
      startDate,
      endDate,
      (error, response) => {
        if (error) {
          console.error(
            "❌ Error retrieving transactions:",
            error.response || error
          );
          reject({
            error: true,
            message: "Could not retrieve transactions",
            details: error.response || error.message,
          });
        } else {
          const transactions = response?.agreement_transaction_list || [];

          if (transactions.length === 0) {
            return resolve({
              error: true,
              message: "No transactions found for this subscription.",
            });
          }

          const latestTransaction = transactions[0]; // First transaction in the list is the latest
          resolve({
            error: false,
            saleId: latestTransaction.transaction_id,
          });
        }
      }
    );
  });
};

const refundPaypalPayment = async (body, paypal) => {
  let saleId = body.saleId;
  let refundAmount = body.refundAmount;
  let currency = body.currency;

  console.log("body", body);
  const refundData = {
    amount: {
      total: refundAmount.toFixed(2), // Convert to 2 decimal places
      currency: currency.toUpperCase(),
    },
  };

  return new Promise((resolve, reject) => {
    paypal.sale.refund(saleId, refundData, (error, refund) => {
      if (error) {
        console.log("Error processing refund:", error);
        reject(error);
      } else {
        resolve({
          error: false,
          message: "Refund processed successfully",
          response: refund,
        });
      }
    });
  });
};

module.exports = {
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
};
