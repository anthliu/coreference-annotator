import { Meteor } from 'meteor/meteor';

import './data.js';

Meteor.startup(() => {
    // code to run on server at startup
    // TODO make this work with other documents
    tokens_base = text_to_entities(segment1 + " " + segment2 + " " + segment3);
    tokens_1 = text_to_entities(segment1);
    tokens_2 = text_to_entities(segment2);
    tokens_3 = text_to_entities(segment3);

    box_words = [];
    coref_group_arr = [];

    var process_tokens = function(arr) {
        box_words.push([]);
        for (var i = 0; i < arr.length; i++) {
            if (arr[i][0]) {
                doc_ind = box_words.length - 1;
                box_words[doc_ind].push(arr[i][1]);

                box_ind = box_words[doc_ind].length - 1;
                coref_group_arr.push([doc_ind, box_ind]);
            }
        }
    };
    process_tokens(tokens_1);
    process_tokens(tokens_2);
    process_tokens(tokens_3);

    coref_groups = {}
    coref_groups_lookup = {}
    for (var i = 0; i < coref_group_arr.length; i++) {
        coref_groups[i] = [coref_group_arr[i]];
        coref_groups_lookup[JSON.stringify(coref_group_arr[i])]
            = i.toString();
    }
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

function combine_groups(group_1, group_2) {
    console.log(group_1);
    console.log(group_2);
    var hash = function(arr) {
        return JSON.stringify(arr);
    };
    if (group_1 == group_2) {
        return;
    } else {
        if (coref_groups[group_1].length
            > coref_groups[group_2].length) {
            max_group = group_1;
            min_group = group_2;
        } else {
            max_group = group_2;
            min_group = group_1;
        }
        for (var i = 0; i < coref_groups[min_group].length; i++) {
            coref_groups[max_group].push(coref_groups[min_group][i]);
            coref_groups_lookup[hash(coref_groups[min_group][i])] = max_group;
            //console.log(coref_groups[min_group][i]);
        }
        delete coref_groups[min_group];
    }
}

Meteor.methods({
    test: function() {
        console.log('hi');
    },
    get_tokens: function(mode, segment) {
        if (mode == 'baseline') {
            tokens = tokens_base
        } else {
            tokens = [tokens_1, tokens_2, tokens_3][parseInt(segment) - 1];
        }
        return tokens;
    },
    process_annotation: function(segs, from, to) {
        var seg = parseInt(segs) - 1;
        var box_1 = [seg, from];
        var box_2 = [seg, to];
        var hash = function(arr) {
            return JSON.stringify(arr);
        };
        var group_1 = coref_groups_lookup[hash(box_1)];
        var group_2 = coref_groups_lookup[hash(box_2)];
        combine_groups(group_1, group_2);
    },
    process_group_annotation: function(from, to) {
        combine_groups(from, to);
    },
    get_coref_groups: function() {
        return {
            'box_words': box_words,
            'coref_groups': coref_groups,
            //'coref_groups_lookup': coref_groups_lookup
        };
    }
});
