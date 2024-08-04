function addPolynomials(a, b, mod) {
  const result = [];
  for (let i = 0; i < a.length; i++) {
    result[i] = (a[i] + b[i]) % mod;
  }
  return result;
}

function subtractPolynomials(a, b, mod) {
  const result = [];
  for (let i = 0; i < a.length; i++) {
    result[i] = (a[i] - b[i] + mod) % mod;
  }
  return result;
}

function multiplyPolynomials(a, b, mod) {
  const result = new Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      result[i + j] = (result[i + j] + a[i] * b[j]) % mod;
    }
  }
  return result.slice(0, a.length);
}

// Key Generation
const N = 11; // parameter
const q = 3; // modulus

function generateRandomPolynomial(degree, mod) {
  return Array.from({ length: degree }, () => Math.floor(Math.random() * mod));
}

function generateKeypair() {
  const f = generateRandomPolynomial(N, 2);
  const g = generateRandomPolynomial(N, 2);
  const h = addPolynomials(f, g, q);
  return { f, g, h };
}

// Encryption/Decryption
function encrypt(message, h, mod) {
  const m = message.split("").map((char) => char.charCodeAt(0) % mod);
  const r = generateRandomPolynomial(N, 2);
  const e = addPolynomials(m, multiplyPolynomials(r, h, mod), mod);
  return e;
}

function decrypt(ciphertext, f, mod) {
  const message = subtractPolynomials(
    ciphertext,
    multiplyPolynomials(f, ciphertext, mod),
    mod
  );
  return String.fromCharCode(...message);
}

module.exports = {
  generateKeypair,
  encrypt,
  decrypt,
};
