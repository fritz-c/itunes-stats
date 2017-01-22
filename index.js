/* eslint-env node, es6 */
'use strict';
require('es6-promise').polyfill();
require('isomorphic-fetch');
const parseXML = require('xml2js').parseString;
const Podcast = require('./podcast');
const Review = require('./review');

const LOCALE = 'jp';
const TOP_PODCAST_COUNT = 50;

// https://itunes.apple.com/jp/rss/toppodcasts/limit=50/explicit=true/xml
// https://itunes.apple.com/jp/rss/customerreviews/page=1/id=653415937/sortBy=mostRecent/xml
const topPodcastUrl = `https://itunes.apple.com/${LOCALE}/rss/toppodcasts/limit=${TOP_PODCAST_COUNT}/explicit=true/xml`;
const getReviewPageUrl = (id, page) =>
    `https://itunes.apple.com/${LOCALE}/rss/customerreviews/page=${page}/id=${id}/sortBy=mostRecent/xml`;

/**
 * Get a promise for parsed xml at the given url
 *
 * @return {Promise} promise that contains the parsed XML
 */
const getParsedXMLAtUrl = (url) =>
    fetch(url) // eslint-disable-line no-undef
        .then(response => response.text()) // First response with headers and start of writable object
        .then((rawXML) => new Promise((resolve, reject) =>
            // By now, the entire text body has been read in.
            // We now parse the xml and resolve the new promise when parsing is done
            parseXML(rawXML, (err, parsed) => err ? reject(err) : resolve(parsed))
        ));

const getTopPodcasts = () =>
    getParsedXMLAtUrl(topPodcastUrl)
        .then((parsed) => {
            // Working with the parsed xml object
            return parsed.feed.entry.map(entry => new Podcast(entry));
        });

const getReviewsForPodcastAtUrl = (url) => {
    return getParsedXMLAtUrl(url)
        .then((parsed) => {
            // Working with the parsed xml object
            const nextLink = parsed.feed.link.filter(link => link.$.rel === 'next');
            const selfLink = parsed.feed.link.filter(link => link.$.rel === 'self');
            const lastLink = parsed.feed.link.filter(link => link.$.rel === 'last');

            const nextUrl = nextLink.length > 0 ? nextLink[0].$.href : null;
            const selfPage = selfLink.length > 0 ? selfLink[0].$.href.match(/page=([0-9]*)/)[1] : '1';
            const lastPage = lastLink.length > 0 ? lastLink[0].$.href.match(/page=([0-9]*)/)[1] : '1';

            // slice(1) omits the podcast entry included first on each page
            const rawReviews = parsed.feed.entry ? parsed.feed.entry.slice(1) : [];

            // Only proceed if there is a next url, and this result set is not the last
            if (nextUrl && selfPage !== lastPage) {
                return new Promise((resolve) => {
                    getReviewsForPodcastAtUrl(nextUrl).then((moreRawReviews) => {
                        resolve(rawReviews.concat(moreRawReviews));
                    });
                });
            }

            return Promise.resolve(rawReviews);
        });
}

getTopPodcasts().then((topPodcasts) => {
    getReviewsForPodcastAtUrl(getReviewPageUrl(topPodcasts[0].id, 1))
        .then((rawReviews) => {
            const reviews = rawReviews.map(r => new Review(r));
            reviews.forEach((r) => {
                console.log(r.info());
            });
        });
});
