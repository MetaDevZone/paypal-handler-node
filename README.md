Here's a revised documentation for the `paypal-handler` file, tailored to describe its role and functions clearly. This assumes the file is implementing actual PayPal API operations using validated data:

---

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

## Prerequisites

Before using the functions in `PayPal Handler`, ensure you have:

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
const config = {
  mode: "sandbox",
  client_id: "your-client-id",
  client_secret: "your-client-secret",
};

configurePaypal(config);
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
const payload = {
  amount: 100.0,
  currency: "USD",
  return_url: "https://example.com/success",
};

createOneTimePayment(payload);
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

executePayment(paymentId, payerId);
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
const payload = {
  amount: 50.0,
  currency: "USD",
  frequency: "MONTHLY",
  plan_name: "Basic Plan",
  trial_period_days: 7,
  return_url: "https://example.com/recurring/success",
};

createRecurringPaymentPlan(payload);
```

---

### `createFixedRecurringPayment(payload)`

Creates a recurring payment plan with a fixed number of cycles.

#### Parameters:
- `payload` (object): Validated payload for fixed-cycle recurring payments. Must include:
  - `amount`, `currency`, `frequency`, `plan_name`, `trial_period_days`, and `cycles`.

#### Example:
```javascript
const payload = {
  amount: 20.0,
  currency: "USD",
  frequency: "YEARLY",
  plan_name: "Yearly Plan",
  trial_period_days: 14,
  cycles: 12,
  return_url: "https://example.com/fixed/success",
};

createFixedRecurringPayment(payload);
```

---

### `createInstallmentPayment(payload)`

Creates a payment plan based on installments.

#### Parameters:
- `payload` (object): Validated payload for installment payments. Must include:
  - `amount`, `initial_amount`, `currency`, `frequency`, `plan_name`, and `cycles`.

#### Example:
```javascript
const payload = {
  amount: 1000.0,
  initial_amount: 200.0,
  currency: "USD",
  frequency: "MONTHLY",
  plan_name: "Installment Plan",
  cycles: 5,
  return_url: "https://example.com/installments/success",
};

createInstallmentPayment(payload);
```

---

### `executeBillingAgreement(token)`

Executes a billing agreement for recurring payments.

#### Parameters:
- `token` (string): The token returned from PayPal after user approval.

#### Example:
```javascript
const token = "EC-12345";

executeBillingAgreement(token);
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

### Example:
```javascript
const result = createOneTimePayment(payload);

if (result.success) {
  console.log("Payment Created:", result.data);
} else {
  console.error("Payment Error:", result.error);
}
```



## License

This utility is open-source and licensed under the [MIT License](LICENSE).

---

## Contributions

Contributions are welcome! Please feel free to open issues, submit PRs, or suggest improvements.

## Author

[MetaDevZone](https://yourwebsite.com)

