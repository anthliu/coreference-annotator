import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';
import './util.js';

function load_canvas() {
    var canvas = document.getElementById('annotation_canvas');
    return canvas.getContext('2d');
}

var CANVAS_WIDTH = 800;
var CANVAS_HEIGHT = 2000;

function set_canvas() {
    var canvas = document.getElementById('annotation_canvas');
    canvas.setAttribute('width', CANVAS_WIDTH);
    canvas.setAttribute('height', CANVAS_HEIGHT);
    return canvas;
}

function render_tokens(context, tokens) {
    var LINE_HEIGHT = 40;
    var MAX_WIDTH = Math.ceil(CANVAS_WIDTH * 0.9);
    var x = (CANVAS_WIDTH - MAX_WIDTH) / 2;
    var y = 60;
    var BOX_HEIGHT = 30;
    var BOX_BORDER_WIDTH = 2;
    context.font = '16pt Calibri';
    context.fillStyle = '#333';

    var measure_width = function(s) {
        return context.measureText(s).width;
    }
    var draw_boxes = function(boxes) {
        context.save();
        context.lineWidth = BOX_BORDER_WIDTH;
        context.strokeStyle = 'black';
        for (var i = 0; i < boxes.length; i++) {
            context.rect(boxes[i][0], boxes[i][1], boxes[i][2], boxes[i][3]);
            context.stroke();
        }
        context.restore();
    }

    var line = "";
    var all_boxes = [];
    var box_words = [];
    var save_boxes = function(y, boxes) {
        for (var i = 0; i < boxes.length; i++) {
            var box = [boxes[i][0], y - BOX_HEIGHT + 2 * BOX_BORDER_WIDTH, boxes[i][1] - boxes[i][0], BOX_HEIGHT];
            all_boxes.push(box);
        }
    }

    var boxes = []
    for (var i = 0; i < tokens.length; i++) {
        var old_width = measure_width(line);
        var new_line = line + tokens[i][1] + ' ';
        var new_width = measure_width(new_line);
        if (new_width > MAX_WIDTH && i > 0) {
            context.fillText(line, x, y);
            line = tokens[i][1] + ' ';
            save_boxes(y, boxes);
            boxes = [];
            box = [x, x + measure_width(line)];
            y += LINE_HEIGHT;
        } else {
            line = new_line;
            box = [x + old_width, x + new_width];
        }
        if (tokens[i][0]) {
            // if it's a target word, add to boxes
            boxes.push(box);
            box_words.push(tokens[i][1]);
        }
    }
    context.fillText(line, x, y);
    save_boxes(y, boxes);
    draw_boxes(all_boxes);
    return [all_boxes, box_words];
}

function matcher_refresh() {
    Meteor.call(
        'get_coref_groups',
        function(err, res) {
            group_ids = [];
            groups = [];
            for (var key in res['coref_groups']) {
                box_group = res['coref_groups'][key];
                box_group_words = [];
                for (var i = 0; i < box_group.length; i++) {
                    box_group_words.push(
                        res['box_words'][box_group[i][0]][box_group[i][1]]
                    )
                }
                group_ids.push(key);
                groups.push(box_group_words);
            }
            render_groups(group_ids, groups);
        }
    );
}

function render_groups(group_ids, groups) {
    var canvas = set_canvas();
    context = load_canvas();

    var LINE_HEIGHT = 20;
    var MAX_WIDTH = Math.ceil(CANVAS_WIDTH * 0.9);
    var PADDING = 15;
    var x_0 = (CANVAS_WIDTH - MAX_WIDTH) / 2;
    var y_0 = 60;
    context.font = '12pt Calibri';
    context.fillStyle = '#333';

    var measure_width = function(s) {
        return context.measureText(s).width;
    }
    var group_dimensions = function(group) {
        var max_width = 0;
        for (var i = 0; i < group.length; i++) {
            token = ' ' + group[i] + ' ';
            max_width = Math.max(max_width, measure_width(token));
        }
        return [max_width, LINE_HEIGHT * group.length];
    }
    var all_boxes = [];
    var draw_group = function(x, y, group) {
        var y_0 = y;
        max_width = 0;
        for (var i = 0; i < group.length; i++) {
            var token = group[i];
            token = ' ' + token + ' ';
            context.fillText(token, x, y);
            max_width = Math.max(max_width, measure_width(token));
            y += LINE_HEIGHT;
        }
        context.rect(x, y_0 - LINE_HEIGHT, max_width, y - y_0 + LINE_HEIGHT/3);
        all_boxes.push([x, y_0 - LINE_HEIGHT, max_width, y - y_0 + LINE_HEIGHT/3]);
        context.stroke();
    }

    var line = "";
    var boxes = [];

    var cur_x = x_0;
    var cur_y = y_0;
    var y_delta = 0;

    for (var i = 0; i < groups.length; i++) {
        var box_size = group_dimensions(groups[i]);
        if (box_size[0] + cur_x > MAX_WIDTH) {
            cur_x = x_0;
            cur_y += y_delta + PADDING;
            y_delta = 0;
        }
        draw_group(cur_x, cur_y, groups[i]);
        y_delta = Math.max(y_delta, box_size[1]);
        cur_x += box_size[0] + PADDING;
    }
    add_event_listeners_matcher(canvas, all_boxes, group_ids);
}

function add_event_listeners_matcher(canvas, boxes, box_words) {
    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    context = canvas.getContext('2d');
    context.lineWidth = 2;
    context.strokeStyle = 'black';
    var detect_box = function (x, y) {
        var intersect = function(box) {
            return (x >= box[0])
                && (x <= box[0] + box[2])
                && (y >= box[1])
                && (y <= box[1] + box[3])
        }
        for (var i = 0; i < boxes.length; i++) {
            if (intersect(boxes[i])) {
                return i;
            }
        }
        return -1;
    }
    var set_notification = function(s) {
        $("#notification").text(s);
    }
    var prev_pos = undefined;
    var prev_box = -1;
    var listener = function(evt) {
        var cur_pos = getMousePos(canvas, evt);
        var cur_box = detect_box(cur_pos.x, cur_pos.y);
        if (prev_box >= 0 && cur_box >= 0) {
            context.moveTo(prev_pos.x, prev_pos.y);
            context.lineTo(cur_pos.x, cur_pos.y);
            context.stroke();
            set_notification(box_words[prev_box] + ' -> ' + box_words[cur_box]);
            Meteor.call(
                'process_group_annotation',
                box_words[prev_box],
                box_words[cur_box],
                function (err) {
                    debind();
                    matcher_refresh();
                }
            );
            prev_pos = undefined;
            prev_box = -1;


        } else if (prev_box >= 0) {
            return;
        } else {
            prev_pos = cur_pos;
            prev_box = cur_box;
            cur_box = -1;
            set_notification(box_words[prev_box]);
        }
    };
    var debind = function() {
        canvas.removeEventListener("mousedown", listener);
    }
    canvas.addEventListener('mousedown', listener, false);
}

function add_event_listeners(canvas, state) {
    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    context = canvas.getContext('2d');
    context.lineWidth = 2;
    context.strokeStyle = 'black';
    boxes = state.get()['boxes'];
    box_words = state.get()['box_words'];
    var detect_box = function (x, y) {
        var intersect = function(box) {
            return (x >= box[0])
                && (x <= box[0] + box[2])
                && (y >= box[1])
                && (y <= box[1] + box[3])
        }
        for (var i = 0; i < boxes.length; i++) {
            if (intersect(boxes[i])) {
                return i;
            }
        }
        return -1;
    }
    var set_notification = function(s) {
        $("#notification").text(s);
    }
    var prev_pos = undefined;
    var prev_box = -1;
    canvas.addEventListener('mousedown', function(evt) {
        var cur_pos = getMousePos(canvas, evt);
        var cur_box = detect_box(cur_pos.x, cur_pos.y);
        if (prev_box >= 0 && cur_box >= 0) {
            context.moveTo(prev_pos.x, prev_pos.y);
            context.lineTo(cur_pos.x, cur_pos.y);
            context.stroke();
            Meteor.call(
                'process_annotation',
                state.get()['segment'],
                prev_box,
                cur_box
            );

            set_notification(box_words[prev_box] + ' -> ' + box_words[cur_box]);
            prev_pos = undefined;
            prev_box = -1;
        } else if (prev_box >= 0) {
            return;
        } else {
            prev_pos = cur_pos;
            prev_box = cur_box;
            cur_box = -1;
            set_notification(box_words[prev_box]);
        }
    }, false);
}

function render(state) {
    var snapshot = state.get();

    set_canvas();
    context = load_canvas();

    result = render_tokens(context, snapshot['tokens'], tokens);
    boxes = result[0];
    box_words = result[1];
    state.set($.extend(state.get(), {
        'boxes': boxes,
        'box_words': box_words,
    }));

    //} else if (snapshot['mode'] == 'matcher') {
    //    console.log('matcher');
    //    tokens = text_to_entities("BOI");
    //    render_groups(context, matcher);
    //}
}

Template.annotation_window.onCreated(function annotationOnCreated() {
    // counter starts at 0
    this.counter = new ReactiveVar(0);
    this.state = new ReactiveVar({});
    var result = getJsonFromUrl(window.location.href);
    this.state.set($.extend(this.state.get(), result))

    console.log(this.state.get());
});

Template.annotation_window.helpers({
    counter() {
        return Template.instance().counter.get();
    },
});

Template.annotation_window.events({
    'click button'(event, instance) {
        // increment the counter when button is clicked
        instance.counter.set(instance.counter.get() + 1);
        if (instance.state.get()['mode'] === 'matcher') {
            setInterval(matcher_refresh, 1000);
            matcher_refresh();
        } else {
            tokens = Meteor.call(
                'get_tokens', instance.state.get()['mode'], instance.state.get()['segment'],
                function(err, tokens) {
                    instance.state.set($.extend(instance.state.get(), {'tokens': tokens}));
                    render(instance.state);

                    var canvas = document.getElementById('annotation_canvas');
                    add_event_listeners(canvas, instance.state);
                }
            );
        }
    },
});

