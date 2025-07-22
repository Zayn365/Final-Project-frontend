// src/utils/formatNumber.js
export function formatWithCommas(value, opts) {
  const maxDecimals = (opts && opts.maxDecimals) != null ? opts.maxDecimals : 2;
  const round = opts && opts.round === true;

  if (value === null || value === undefined) return '';

  let str = String(value).trim();
  if (!str) return '';

  str = str.replace(/[, ]+/g, '');

  if (!/^[-+]?\d*\.?\d*$/.test(str)) return str;

  let sign = '';
  if (str[0] === '-' || str[0] === '+') {
    sign = str[0] === '-' ? '-' : '';
    str = str.slice(1);
  }

  let intPart = str;
  let decPart;
  if (str.includes('.')) {
    const parts = str.split('.');
    intPart = parts[0] || '0';
    decPart = parts[1] || '';
  }

  intPart = intPart.replace(/^0+(?=\d)/, '');
  if (!intPart) intPart = '0';

  const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  if (decPart === undefined) {
    return sign + intFormatted;
  }

  if (decPart.length > maxDecimals) {
    if (round) {
      const num = Number(sign + intPart + '.' + decPart);
      const rounded = num.toFixed(maxDecimals);
      let [rInt, rDec] = rounded.split('.');
      let rSign = '';
      if (rInt.startsWith('-')) {
        rSign = '-';
        rInt = rInt.slice(1);
      }
      rInt = rInt.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      rDec = rDec.replace(/0+$/, '');
      return rSign + rInt + (rDec ? '.' + rDec : '');
    } else {
      decPart = decPart.slice(0, maxDecimals);
    }
  }

  return sign + intFormatted + (decPart.length ? '.' + decPart : '');
}

export function unformatNumber(str) {
  if (str == null) return '';
  return String(str).replace(/,/g, '').trim();
}

export function parseFormattedNumber(str) {
  const raw = unformatNumber(str);
  const n = Number(raw);
  return Number.isFinite(n) ? n : NaN;
}
