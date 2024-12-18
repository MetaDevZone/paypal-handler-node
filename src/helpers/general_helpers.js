const GET_DISCOUNTED_AMOUNTS = (
  discount,
  discount_type,
  initial_amount,
  installment_amount
) => {
  let discount_initial_amount = 0;
  let discount_installment_amount = 0;
  let discounted_initial_amount = 0;
  let discounted_installment_amount = 0;
  if (discount_type === "percentage") {
    let discount_value = discount / 100;
    discount_initial_amount = initial_amount * discount_value;
    discount_installment_amount = installment_amount * discount_value;
  } else {
    discount_initial_amount = discount;
    discount_installment_amount = discount;
  }
  let initial_amount_after_discount = initial_amount - discount_initial_amount;
  let installment_amount_after_discount =
    installment_amount - discount_installment_amount;
  if (initial_amount_after_discount > 0) {
    discounted_initial_amount = initial_amount_after_discount;
  }
  if (installment_amount_after_discount > 0) {
    discounted_installment_amount = installment_amount_after_discount;
  }
  return { discounted_initial_amount, discounted_installment_amount };
};

module.exports = { GET_DISCOUNTED_AMOUNTS };
