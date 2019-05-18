module.exports = {
    /**
     * wraps the text.
     * http://jsfiddle.net/eECar/16/
     * https://stackoverflow.com/questions/16220562/word-wrapping-in-html5-canvas/16221307#16221307
     * @param ctx the node canvas context
     * @param text the text to analyze
     * @param maxWidth the max width of the text.
     * @returns {Array}
     */
    getLines: function (ctx, text, maxWidth) {


        let lines = [];
        if (!text) return lines;

        // Start calculation
        while (text.length) {

            let i;
            for (i = text.length; ctx.measureText(text.substr(0, i)).width > maxWidth; i--) ;

            let result = text.substr(0, i);

            let j;
            if (i !== text.length)
                for (j = 0; result.indexOf(' ', j) !== -1; j = result.indexOf(' ', j) + 1) ;

            lines.push(result.substr(0, j || result.length));

            // moves to separate line instead of just cutting it off to new line
            // let width = Math.max( width, ctx.measureText(lines[ lines.length-1 ]).width );
            text = text.substr(lines[lines.length - 1].length, text.length);
        }

        return lines;
    }
};
