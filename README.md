
# PayPal Handler Documentation

**PayPal Handler** is a utility file designed to handle and streamline PayPal API interactions. It provides methods for configuring PayPal, creating payment plans, executing payments, and managing recurring payment cycles.

---

## Features

- **PayPal Configuration**: Set up PayPal client with environment details.
- **One-Time Payments**: Create and execute one-time payment transactions.
- **Recurring Payments**: Manage subscription-based payment plans.
- **Installments**: Facilitate installment-based payment plans.
- **Execute Payments**: Execute and finalize PayPal transactions.
- **Billing Agreements**: Execute billing agreements seamlessly.


---
### installation 

---
npm i paypal-handler

## Prerequisites


Before using the `PayPal Handler`, ensure you have:

1. A PayPal Developer account.
2. PayPal API credentials (`client_id` and `client_secret`).

---

## Configuration

### `configurePaypal(config)`

Configures PayPal SDK with `client_id`, `client_secret`, and `mode` (sandbox/live).

#### Parameters:
- `config` (object): Configuration object containing:
  - `mode` (string): PayPal environment (`sandbox` or `live`).
  - `client_id` (string): PayPal API Client ID.
  - `client_secret` (string): PayPal API Client Secret.

#### Example:
```javascript
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
```

---

## Payment Operations

### `createOneTimePayment(payload)`

Creates a one-time payment transaction.

#### Parameters:
- `payload` (object): Validated payload for one-time payment. Must include:
  - `amount` (number): Payment amount.
  - `currency` (string): ISO currency code (e.g., `USD`).
  - `return_url` (string): Redirect URL after payment approval.
  - `discount`, `discount_type`, and `tax` (optional): Payment adjustments.

#### Example:
```javascript
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
      console.log(error);
      throw new Error(error);
    }
    return response;
  } catch (error) {
    return error;
  }
};
```

---

### `executePayment(paymentId, payerId)`

Executes a PayPal payment after it has been approved by the user.

#### Parameters:
- `paymentId` (string): The ID of the payment to execute.
- `payerId` (string): The PayPal payer ID.

#### Example:
```javascript
const paymentId = "PAY-12345";
const payerId = "PAYER-67890";
const executePaymentFunction = async (paypal, paymentId, payerId) => {
  try {
    let execute_payment_obj = {
      payment_id: paymentId,
      payer_id:payerId ,
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
```

---

### `createRecurringPaymentPlan(payload)`

Creates a recurring payment plan (e.g., subscriptions).

#### Parameters:
- `payload` (object): Validated payload for a recurring payment plan. Must include:
  - `amount`, `currency`, `frequency`, `plan_name`, and `trial_period_days`.
  - Optional adjustments like `discount`, `discount_type`, `tax`, or `custom_days`.

#### Example:
```javascript
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
```

---

### `createFixedRecurringPayment(payload)`

Creates a recurring payment plan with a fixed number of cycles.

#### Parameters:
- `payload` (object): Validated payload for fixed-cycle recurring payments.

#### Example:
```javascript
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
```

---

### `createInstallmentPayment(payload)`

Creates a payment plan based on installments.

#### Parameters:
- `payload` (object): Validated payload for installment payments. 

#### Example:
```javascript
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
```

---

### `executeBillingAgreement(token)`

Executes a billing agreement for recurring payments.

#### Parameters:
- `token` (string): The token returned from PayPal after user approval.

#### Example:
```javascript
const token = "EC-12345";
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
```

---

## Error Handling

All functions return a consistent response format to simplify integration:

- **On Success:**
  ```json
  {
    "success": true,
    "data": "<PayPal API response>"
  }
  ```

- **On Failure:**
  ```json
  {
    "success": false,
    "error": "<error details>"
  }
  ```


## Examples 
  Please Refer to Examples Folder for better understanding 



## License

This utility is open-source and licensed under the [MIT License](LICENSE).

---

## Contributions

Contributions are welcome! Please feel free to open issues, submit PRs, or suggest improvements.

## Author

[MetaDevZone](https://metadevzone.com)



