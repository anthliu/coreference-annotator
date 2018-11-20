import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';
import './util.js';
import './data.js';

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
}

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
    var draw_boxes = function(y, boxes) {
        context.save();
        context.lineWidth = BOX_BORDER_WIDTH;
        context.strokeStyle = 'black';
        for (var i = 0; i < boxes.length; i++) {
            context.rect(boxes[i][0], y - BOX_HEIGHT + 2 * BOX_BORDER_WIDTH, boxes[i][1] - boxes[i][0], BOX_HEIGHT);
            context.stroke();
        }
        context.restore();
    }

    var line = "";
    var boxes = [];

    for (var i = 0; i < tokens.length; i++) {
        var old_width = measure_width(line);
        var new_line = line + tokens[i][1] + ' ';
        var new_width = measure_width(new_line);
        if (new_width > MAX_WIDTH && i > 0) {
            context.fillText(line, x, y);
            line = tokens[i][1] + ' ';
            draw_boxes(y, boxes);
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
        }
    }
    context.fillText(line, x, y);
    draw_boxes(y, boxes);
}

function render_groups(context, groups) {
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
        context.stroke();
    }

    var line = "";
    var boxes = [];

    var cur_x = x_0;
    var cur_y = y_0;
    var y_delta = 0;

    for (var i = 0; i < groups.length; i++) {
        for (var j = 0; j < groups[i].length; j++) {
            var box_size = group_dimensions(groups[i][j]);
            if (box_size[0] + cur_x > MAX_WIDTH) {
                cur_x = x_0;
                cur_y += y_delta + PADDING;
                y_delta = 0;
            }
            draw_group(cur_x, cur_y, groups[i][j]);
            y_delta = Math.max(y_delta, box_size[1]);
            cur_x += box_size[0] + PADDING;
        }
    }
}

function add_event_listeners(canvas) {
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
    var prev_pos = undefined;
    var made_click = false;
    canvas.addEventListener('mousedown', function(evt) {
        var cur_pos = getMousePos(canvas, evt);
        if (made_click == true) {
            context.moveTo(prev_pos.x, prev_pos.y);
            context.lineTo(cur_pos.x, cur_pos.y);
            context.stroke();
        }
        made_click = !made_click;
        prev_pos = cur_pos;
    }, false);
}

function render(state) {
    var snapshot = state.get();

    set_canvas();
    context = load_canvas();
    if (snapshot['mode'] == 'baseline') {
        console.log('baseline');
        tokens = text_to_entities(segment1 + " " + segment2 + " " + segment3);
        render_tokens(context, tokens);
    } else if (snapshot['mode'] == 'segment') {
        console.log('segment');
        tokens = text_to_entities([segment1, segment2, segment3][parseInt(snapshot['segment']) - 1]);
        render_tokens(context, tokens);
    } else if (snapshot['mode'] == 'matcher') {
        console.log('matcher');
        tokens = text_to_entities("BOI");
        render_groups(context, matcher);
    }
}

Template.annotation_window.onCreated(function annotationOnCreated() {
    // counter starts at 0
    this.counter = new ReactiveVar(0);
    this.state = new ReactiveVar({});
    var result = getJsonFromUrl(getJsonFromUrl(window.location.href));
    this.state.set($.extend(this.counter.get(), result))

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
        render(instance.state);
        var canvas = document.getElementById('annotation_canvas');
        add_event_listeners(canvas);
    },
});
