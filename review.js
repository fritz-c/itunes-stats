'use strict';

class Review {
    constructor(allData) {
        this.reviewerName = allData.author[0].name[0];
        this.title = allData.title[0];
        this.rating = allData['im:rating'];

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
}

module.exports = Review;
