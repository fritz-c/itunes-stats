'use strict';

const getParsedXMLAtUrl = require('./util').getParsedXMLAtUrl;

class Review {
    constructor(allData) {
        this.reviewerName = allData.author[0].name[0];
        this.title = allData.title[0];
        this.rating = allData['im:rating'][0];

        const textContent = allData.content.filter(c => c.$.type === 'text');
        this.body = textContent.length > 0 ? textContent[0]._ : '';
    }

    info() {
        return (
            'rating: ' + this.rating +
            ' title: ' + this.title +
            ' body: ' + this.body +
            ' reviewerName: ' + this.reviewerName
        );
    }

    static getReviewPageUrl(id, locale, page) {
        page = page || 1;
        return `https://itunes.apple.com/${locale}/rss/customerreviews/page=${page}/id=${id}/sortBy=mostRecent/xml`;
    }

    static getReviewsForPodcastAtUrl(url) {
        return getParsedXMLAtUrl(url)
            .then((parsed) => {
                // Working with the parsed xml object
                const nextLink = parsed.feed.link.filter(link => link.$.rel === 'next');
                const selfLink = parsed.feed.link.filter(link => link.$.rel === 'self');
                const lastLink = parsed.feed.link.filter(link => link.$.rel === 'last');

                // Get rid of the query string on the url, because it was screwing up `next` link acquisition
                // on subsequent pages.
                const nextUrl = nextLink.length > 0 ? nextLink[0].$.href.replace(/\?.*/, '') : null;
                const selfPage = (selfLink.length > 0 && selfLink[0].$.href) ?
                    selfLink[0].$.href.match(/page=([0-9]*)/)[1] :
                    '1';
                const lastPage = (lastLink.length > 0 && lastLink[0].$.href) ?
                    lastLink[0].$.href.match(/page=([0-9]*)/)[1] :
                    '1';

                // slice(1) omits the podcast entry included first on each page
                const reviews = parsed.feed.entry ? parsed.feed.entry.slice(1).map(r => new Review(r)) : [];

                // Only proceed if there is a next url, and this result set is not the last
                if (nextUrl && selfPage !== lastPage) {
                    return new Promise((resolve) => {
                        Review.getReviewsForPodcastAtUrl(nextUrl).then((moreReviews) => {
                            resolve(reviews.concat(moreReviews));
                        });
                    });
                }

                return Promise.resolve(reviews);
            });
    }
}

module.exports = Review;
