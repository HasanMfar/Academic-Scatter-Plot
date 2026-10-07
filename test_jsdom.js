const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const XLSX = require('xlsx');

const html = fs.readFileSync('F:\\Uni\\Uni\\PLOT\\index.html', 'utf-8');
const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });

dom.window.XLSX = XLSX;

dom.window.document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    try {
      const appJs = fs.readFileSync('F:\\Uni\\Uni\\PLOT\\app.js', 'utf-8');
      dom.window.eval(appJs);
      console.log("No global errors in app.js on boot!");
    } catch (e) {
      console.error("BOOT ERROR:", e);
    }
  }, 100);
});
