const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Replace colors cleanly
html = html.replace(/primary:\s*'#522D6D',\s*\/\/\s*Flyadeal Purple \(Official\)/g, "primary: '#0C85A3',     // SalamAir Cyan");
html = html.replace(/secondary:\s*'#3A1D4D',\s*\/\/\s*Darker Purple/g, "secondary: '#07566A',   // Darker Cyan");
html = html.replace(/accent:\s*'#CBDB04',\s*\/\/\s*Flyadeal Lime \(Official\)/g, "accent: '#B1C832',      // SalamAir Lime");

// Prices + Currency
html = html.replace(/SAR\s+([0-9,]+)/g, (match, p1) => {
    let num = parseInt(p1.replace(/,/g, ''), 10);
    let newNum = Math.round(num * 0.10);
    return `OMR ${newNum.toLocaleString()}`;
});

// Update names
html = html.replace(/Flyadeal Holidays/g, 'SalamAir Holidays');
html = html.replace(/Flyadeal/g, 'SalamAir');
html = html.replace(/flyadeal/gi, 'salamair');

// Logo
html = html.replace(/img\/[a-z_]*logo[a-z_]*\.png/gi, 'img/salamair_logo.png');

fs.writeFileSync('index.html', html, 'utf8');
console.log('Update complete.');
