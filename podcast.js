'use strict';

const getParsedXMLAtUrl = require('./util').getParsedXMLAtUrl;
const Review = require('./review');

class Podcast {
    constructor(allData) {
        this.id = allData.id[0].$['im:id'];
        this.title = allData.title[0];
        this.summary = allData.summary[0];
        this.category = allData.category[0].$.label;
        this.reviews = [];
    }

    setReviews(reviews) {
        this.reviews = reviews;
    }

    static getReviewCsvFields() {
        return [
            'rank',
            'id',
            'podcastTitle',
            'category',
            'reviewRating',
            'reviewTitle',
            'reviewBody',
            'reviewerName',
        ];
    }

    getReviewCsvData(rank) {
        return this.reviews.map(review => ({
            rank:         rank,
            id:           this.id,
            podcastTitle: this.title,
            category:     this.category,
            reviewRating: review.rating,
            reviewTitle:  review.title,
            reviewBody:   review.body,
            reviewerName: review.reviewerName,
        }));
    }

    info() {
        return (
            'id: ' + this.id +
            ' title: ' + this.title +
            ' summary: ' + this.summary.substr(0, 20) +
            ' reviewCount: ' + this.reviews.length +
            ' category: ' + this.category
        );
    }

    static getTopPodcasts(locale, count) {
        count = count || 50;
        return getParsedXMLAtUrl(`https://itunes.apple.com/${locale}/rss/toppodcasts/limit=${count}/explicit=true/xml`)
            .then((parsed) => {
                // Working with the parsed xml object
                return parsed.feed.entry.map(entry => new Podcast(entry));
            });
    }

    static setReviewsOnPodcasts(podcasts, locale, index) {
        return new Promise((resolve) => {
            index = index ? index : 0;
            Review.getReviewsForPodcastAtUrl(Review.getReviewPageUrl(podcasts[index].id, locale))
                .then((reviews) => {
                    console.log(`Retrieved reviews for index ${index}, id ${podcasts[index].id}`); // eslint-disable-line no-console
                    podcasts[index].setReviews(reviews);

                    // Stop if we've reached the last podcast
                    if (index >= podcasts.length - 1) {
                        return resolve();
                    }

                    Podcast.setReviewsOnPodcasts(podcasts, locale, index + 1).then(() => resolve());
                });
        });
    }
}

module.exports = Podcast;
