'use strict';

class Podcast {
    constructor(allData) {
        this.id = allData.id[0].$['im:id'];
        this.title = allData.title[0];
        this.summary = allData.summary[0];
        this.category = allData.category[0].$.label;
    }

    info() {
        return (
            'id: ' + this.id +
            ' title: ' + this.title +
            ' summary: ' + this.summary +
            ' category: ' + this.category
        );
    }
}

module.exports = Podcast;
