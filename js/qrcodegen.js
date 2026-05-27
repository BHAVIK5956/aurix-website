/**
 * Minimal TOTP QR Code Generator
 * Generates QR codes as SVG without any external dependencies
 * Supports otpauth:// URIs for authenticator apps
 */

const QRCodeGen = (function() {
  // QR Code error correction levels
  const ECL = { L: 1, M: 0, Q: 3, H: 2 };

  // Galois Field GF(256) for Reed-Solomon error correction
  const GF256 = new Uint8Array(256);
  const GF256_INV = new Uint8Array(256);
  (function() {
    let v = 1;
    for (let i = 0; i < 255; i++) {
      GF256[i] = v;
      GF256_INV[v] = i;
      v = v << 1;
      if (v & 256) v ^= 0x11d;
    }
    GF256_INV[0] = 0;
  })();

  function gfMul(a, b) {
    if (a === 0 || b === 0) return 0;
    return GF256[(GF256_INV[a] + GF256_INV[b]) % 255];
  }

  function rsPoly(nsym) {
    let g = new Uint8Array(1);
    g[0] = 1;
    for (let i = 0; i < nsym; i++) {
      const ng = new Uint8Array(g.length + 1);
      for (let j = 0; j < g.length; j++) {
        ng[j] ^= g[j];
        ng[j + 1] ^= gfMul(g[j], GF256[i]);
      }
      g = ng;
    }
    return g;
  }

  function rsDiv(data, nsym) {
    const gen = rsPoly(nsym);
    const res = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) res[i] = data[i];
    for (let i = 0; i < data.length - nsym; i++) {
      if (res[i] !== 0) {
        const coef = GF256_INV[res[i]];
        for (let j = 0; j < gen.length; j++) {
          res[i + j] ^= gfMul(gen[j], coef);
        }
      }
    }
    return res.slice(data.length - nsym);
  }

  // QR Code capacity table for version 1-10, ECL M
  const CAPACITY = [26, 44, 70, 100, 134, 172, 196, 242, 292, 346];

  // Mode indicators
  const MODE_NUMERIC = 1;
  const MODE_ALPHANUMERIC = 2;
  const MODE_BYTE = 4;

  const ALPHANUMERIC_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';

  function getVersion(dataLen, ecl) {
    const ecwPerBlock = [10, 16, 26, 18, 24, 16, 18, 22, 22, 26]; // M ECL
    const blocksGroup1 = [1, 1, 1, 2, 2, 4, 4, 4, 5, 5];
    for (let v = 9; v >= 0; v--) {
      const totalCodewords = (v + 1) * 16 + (v < 2 ? 104 : (v < 7 ? 128 : 224));
      const totalEC = blocksGroup1[v] * ecwPerBlock[v];
      const totalData = totalCodewords - totalEC;
      if (totalData >= dataLen + 4) return v; // 4 for mode + length
    }
    return 9;
  }

  function encodeAlphanumeric(data) {
    const bits = [];
    // Mode indicator: 0100 for alphanumeric... actually 0100 is byte mode
    // Mode 0100 = alphanumeric
    bits.push(0, 1, 0, 0); // Mode: alphanumeric
    
    // Character count indicator
    const lenBits = data.length.toString(2).padStart(9, '0');
    bits.push(...lenBits.split('').map(Number));

    // Encode characters in pairs
    for (let i = 0; i < data.length; i += 2) {
      const c1 = ALPHANUMERIC_CHARS.indexOf(data[i]);
      if (i + 1 < data.length) {
        const c2 = ALPHANUMERIC_CHARS.indexOf(data[i + 1]);
        const val = c1 * 45 + c2;
        const valBits = val.toString(2).padStart(11, '0');
        bits.push(...valBits.split('').map(Number));
      } else {
        const valBits = c1.toString(2).padStart(6, '0');
        bits.push(...valBits.split('').map(Number));
      }
    }

    // Terminator
    bits.push(0, 0, 0, 0);

    return bits;
  }

  function generateQR(text, eclLevel = ECL.M) {
    const ecl = eclLevel;
    
    // Encode data
    const encoded = encodeAlphanumeric(text.toUpperCase());
    const version = getVersion(encoded.length, ecl);
    
    // Simple version 2 QR (good for short otpauth URIs)
    // For otpauth URIs we'll use byte mode which is more reliable
    return generateByteModeQR(text, ecl);
  }

  function encodeByteMode(data) {
    const bytes = new TextEncoder().encode(data);
    const bits = [];
    // Mode indicator: 0100 for byte mode
    bits.push(0, 1, 0, 0);
    // Character count (8 bits for version 1-9)
    const lenBits = bytes.length.toString(2).padStart(8, '0');
    bits.push(...lenBits.split('').map(Number));
    // Data
    for (const b of bytes) {
      const bBits = b.toString(2).padStart(8, '0');
      bits.push(...bBits.split('').map(Number));
    }
    // Terminator
    bits.push(0, 0, 0, 0);
    return bits;
  }

  function generateByteModeQR(text, eclLevel) {
    const ecl = eclLevel;
    const encoded = encodeByteMode(text);
    const dataLen = Math.ceil(encoded.length / 8);
    
    // Pick version based on data length
    let version = 1;
    const ecCoeff = [[], [], [], [], [10, 7, 17, 13], [26], [18], [22], [26], [30]];
    const ecPerBlock = [7, 10, 15, 20, 26, 18, 20, 24, 30, 18]; // M level
    
    const dataCapacityM = [14, 26, 42, 62, 84, 106, 122, 152, 180, 211];
    
    for (let v = 9; v >= 0; v--) {
      if (dataCapacityM[v] >= dataLen) {
        version = v + 1;
        break;
      }
    }

    const size = 17 + version * 4;
    const totalCodewords = Math.floor((size * size - 3 * 81 - (17 + 4 * version)) / 8) + 4; // Simplified
    const ecPerBlockCount = [0, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18];
    const ecCount = ecPerBlockCount[version];
    const dataCodewords = [0, 16, 28, 44, 64, 86, 108, 126, 158, 186, 220][version];
    
    // Pad bits to fill data codewords
    const totalBits = dataCodewords * 8;
    while (encoded.length < totalBits) encoded.push(0);
    while (encoded.length > totalBits) encoded.pop();

    // Convert bits to bytes
    const dataBytes = [];
    for (let i = 0; i < dataCodewords; i++) {
      let byte = 0;
      for (let j = 0; j < 8; j++) {
        byte = (byte << 1) | (encoded[i * 8 + j] || 0);
      }
      dataBytes.push(byte);
    }

    // Calculate error correction
    const ecBytes = rsDiv(dataBytes, ecCount);
    
    // Interleave data + EC
    const allBytes = [];
    const blocks1 = dataBytes.slice(0, Math.ceil(dataBytes.length / 2));
    const blocks2 = dataBytes.slice(Math.ceil(dataBytes.length / 2));
    const ecBlocks1 = ecBytes.slice(0, Math.ceil(ecBytes.length / 2));
    const ecBlocks2 = ecBytes.slice(Math.ceil(ecBytes.length / 2));

    for (let i = 0; i < Math.max(blocks1.length, blocks2.length); i++) {
      if (i < blocks1.length) allBytes.push(blocks1[i]);
      if (i < blocks2.length) allBytes.push(blocks2[i]);
    }
    for (let i = 0; i < Math.max(ecBlocks1.length, ecBlocks2.length); i++) {
      if (i < ecBlocks1.length) allBytes.push(ecBlocks1[i]);
      if (i < ecBlocks2.length) allBytes.push(ecBlocks2[i]);
    }

    // Convert back to bits
    const allBits = [];
    for (const b of allBytes) {
      const bBits = b.toString(2).padStart(8, '0');
      allBits.push(...bBits.split('').map(Number));
    }

    // Build QR matrix
    const matrix = buildQRMatrix(size, version);
    
    // Place data bits
    placeDataBits(matrix, allBits, size);

    // Generate SVG
    return matrixToSVG(matrix, size);
  }

  function buildQRMatrix(size, version) {
    const matrix = [];
    for (let r = 0; r < size; r++) {
      matrix[r] = new Uint8Array(size).fill(-1); // -1 = undefined
    }

    // Finder patterns (3 corners)
    for (const [cr, cc] of [[0, 0], [0, size - 7], [size - 7, 0]]) {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const on = (r === 0 || r === 6 || c === 0 || c === 6) ||
                     (r >= 2 && r <= 4 && c >= 2 && c <= 4);
          matrix[cr + r][cc + c] = on ? 1 : 0;
        }
      }
    }

    // Separators around finder patterns
    for (let i = 0; i < 8; i++) {
      // Top-left
      if (matrix[7][i] === -1) matrix[7][i] = 0;
      if (matrix[i][7] === -1) matrix[i][7] = 0;
      // Top-right
      if (matrix[7][size - 8 + i] === -1) matrix[7][size - 8 + i] = 0;
      if (matrix[i][size - 8] === -1) matrix[i][size - 8] = 0;
      // Bottom-left
      if (matrix[size - 8][i] === -1) matrix[size - 8][i] = 0;
      if (matrix[size - 8 + i][7] === -1) matrix[size - 8 + i][7] = 0;
    }

    // Timing patterns
    for (let i = 8; i < size - 8; i++) {
      if (matrix[6][i] === -1) matrix[6][i] = (i + 1) % 2;
      if (matrix[i][6] === -1) matrix[i][6] = (i + 1) % 2;
    }

    // Dark module
    matrix[size - 8][8] = 1;

    // Format information areas
    // Around top-left finder
    for (let i = 0; i <= 8; i++) {
      if (matrix[8][i] === -1) matrix[8][i] = 0;
      if (matrix[i][8] === -1) matrix[i][8] = 0;
    }
    // Around top-right finder
    for (let i = 0; i <= 7; i++) {
      if (matrix[8][size - 1 - i] === -1) matrix[8][size - 1 - i] = 0;
    }
    // Around bottom-left finder
    for (let i = 0; i <= 7; i++) {
      if (matrix[size - 1 - i][8] === -1) matrix[size - 1 - i][8] = 0;
    }

    // Version information (version 7+)
    if (version >= 7) {
      for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 3; j++) {
          if (matrix[i][size - 11 + j] === -1) matrix[i][size - 11 + j] = 0;
          if (matrix[size - 11 + j][i] === -1) matrix[size - 11 + j][i] = 0;
        }
      }
    }

    return matrix;
  }

  function placeDataBits(matrix, bits, size) {
    let bitIdx = 0;
    let upward = true;

    for (let right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5; // Skip timing column

      for (let i = 0; i < size; i++) {
        const row = upward ? size - 1 - i : i;

        for (let c = 0; c < 2; c++) {
          const col = right - c;
          if (matrix[row][col] === -1) {
            matrix[row][col] = bitIdx < bits.length ? bits[bitIdx++] : 0;
          }
        }
      }
      upward = !upward;
    }
  }

  function matrixToSVG(matrix, size) {
    const cellSize = 10;
    const quietZone = 4;
    const totalSize = (size + quietZone * 2) * cellSize;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" width="220" height="220">`;
    svg += `<rect width="${totalSize}" height="${totalSize}" fill="#FFFFFF"/>`;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (matrix[r][c] === 1) {
          const x = (c + quietZone) * cellSize;
          const y = (r + quietZone) * cellSize;
          svg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="#1A1A1A"/>`;
        }
      }
    }

    svg += '</svg>';
    return svg;
  }

  // Public API
  return {
    generate: function(text) {
      try {
        return generateByteModeQR(text, ECL.M);
      } catch (e) {
        console.error('QR generation error:', e);
        return null;
      }
    },
    generateImage: function(text, containerId) {
      const svg = this.generate(text);
      if (!svg) return false;
      const container = document.getElementById(containerId);
      if (!container) return false;
      container.innerHTML = svg;
      return true;
    }
  };
})();

// Make globally available
window.QRCodeGen = QRCodeGen;
