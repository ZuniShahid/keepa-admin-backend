/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable prettier/prettier */
const fs = require('fs');
const ejs = require('ejs');

const template = fs.readFileSync('app.dev.tpl.yaml').toString();
const content = ejs.render(template, process.env);

fs.writeFileSync('app.yaml', content);
