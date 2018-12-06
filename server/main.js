import { Meteor } from 'meteor/meteor';

import './data.js';

Meteor.startup(() => {
  // code to run on server at startup
});

function text_to_entities(text) {
    var tokens = text.split(/[ \n\t.,:]+/);
    var entities = [];
    for (var i = 0; i < tokens.length; i++) {
        if (tokens[i] === "") {
            continue;
        }
        if (tokens[i] === "[") {
            ent = []
            var j = i + 1;
            for (; tokens[j] !== "]"; j++) {
                ent.push(tokens[j]);
            }
            i = j;
            entities.push([true, ent.join(' ')]);
        } else {
            entities.push([false, tokens[i]])
        }
    }
    return entities;
}

Meteor.methods({
    test: function() {
        console.log('hi');
    },
    get_tokens: function(mode, segment) {
        if (mode == 'baseline') {
            tokens = text_to_entities(segment1 + " " + segment2 + " " + segment3);
        } else {
            tokens = text_to_entities([segment1, segment2, segment3][parseInt(segment) - 1]);
        }
        return tokens;
    }
});
