/* Pure money helpers shared by the site's counters. No DOM access. */
(function () {
  /**
   * Formats a number the way the app shows money: "$1,284.50".
   * @param {number} value
   * @param {number} decimals Fraction digits to keep (0 or 2 on this site).
   * @returns {string}
   */
  function formatMoney(value, decimals) {
    return '$' + value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }

  /**
   * Reads how many fraction digits a target amount was authored with, so a counter ends on the exact copy.
   * @param {string} raw The data-count attribute value.
   * @returns {number}
   */
  function decimalsOf(raw) {
    const dot = raw.indexOf('.');
    return dot === -1 ? 0 : raw.length - dot - 1;
  }

  window.BudgetGoMoney = { formatMoney: formatMoney, decimalsOf: decimalsOf };
})();
