const PDFDocument = require('pdfkit');
const fs = require('fs');
const _ = require('lodash');

const dashSize = 3;
const dashSpace = 6;
const dashOpacity = .1;
const leftMargin = 15;
const left = 120;
const right = 590;
const numChars = 10;
const bigKanjiFontSize = 100;
const descFontSize = 14;
const topMargin = 40;
const lineHeight = 145;
const maxPerPage = 5;

module.exports = function(entries, filename) {
    const listOfLists = _.chunk(entries, maxPerPage);

    var doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(filename));

    var drawLine = function(index, entry) {
        const character = entry.character;
        const hiragana = entry[entry.important_reading];
        const english = entry.meaning;

        const height = (right - left) / numChars;
        let top = index * lineHeight + topMargin;

        doc.font('fonts/KanjiStrokeOrders_v4.001.ttf')
            .fontSize(bigKanjiFontSize)
            .text(character, leftMargin, top, {
                lineBreak: false
            });

        doc.font('fonts/ipag.ttf')
            .fontSize(descFontSize)
            .text(`${english} - ${hiragana}`, left, top);

        for (let ln = 0; ln <= 1; ln++) {
            let top = index * lineHeight + topMargin + (height * ln) + (descFontSize + (descFontSize * .4));

            doc.lineCap('round').lineJoin('round');

            doc.moveTo(left, top + height / 2)
                .lineTo(right, top + height / 2)
                .dash(dashSize, {space: dashSpace})
                .strokeOpacity(dashOpacity)
                .stroke();

            doc.moveTo(left, top)
                .undash()
                .lineTo(right, top)
                .lineTo(right, top + height)
                .lineTo(left, top + height)
                .lineTo(left, top)
                .strokeOpacity(1)
                .stroke();

            for (let i = 1; i <= numChars; i++) {
                let lft = ((right - left) / (numChars)) * i + left;
                let dashLft = lft - height / 2;

                doc.moveTo(dashLft, top)
                    .dash(dashSize, {space: dashSpace})
                    .lineTo(dashLft, top + height)
                    .strokeOpacity(dashOpacity)
                    .stroke();

                if (i < numChars) {
                    doc.moveTo(lft, top)
                        .undash()
                        .lineTo(lft, top + height)
                        .strokeOpacity(1)
                        .stroke();
                }
            }

        }
    }

    for (let page = 0; page < listOfLists.length; page++) {
        for (let line = 0; line < listOfLists[page].length; line++) {
            drawLine(line, listOfLists[page][line]);
        }

        if (page < (listOfLists.length - 1)) {
            doc.addPage();
        }
    }

    // drawLine(0, '中', 'ちゅう', 'Middle');
    // drawLine(1, '氷', 'こおり', 'Ice');
    // drawLine(2, '氷', 'こおり', 'Ice');
    // drawLine(3, '氷', 'こおり', 'Ice');
    // drawLine(4, '氷', 'こおり', 'Ice');

    doc.end()
};
