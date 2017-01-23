/* eslint-env node, es6 */
'use strict';

require('es6-promise').polyfill();
require('isomorphic-fetch');
const json2csv = require('json2csv');
const fs       = require('fs');

const Podcast = require('./podcast');

const LOCALE = 'jp';

Podcast.getTopPodcasts(LOCALE).then((topPodcasts) => {
    console.log('Retrieved podcasts.'); // eslint-disable-line no-console
    Podcast.setReviewsOnPodcasts(topPodcasts, LOCALE).then(() => {
        const csv = json2csv({
            data: topPodcasts.reduce(
                (all, currentPodcast, index) => all.concat(currentPodcast.getReviewCsvData(index + 1)),
                []
            ),
            fields: Podcast.getReviewCsvFields(),
        });

        fs.writeFile('output/reviews.csv', csv, function(err) {
            if (err) throw err;
            console.log('file saved'); // eslint-disable-line no-console
        });
    });
});
