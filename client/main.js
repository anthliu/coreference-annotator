import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Template.hello.onCreated(function helloOnCreated() {
    // counter starts at 0
    this.counter = new ReactiveVar(0);
});

Template.hello.helpers({
    counter() {
        return Template.instance().counter.get();
    },
});

Template.hello.events({
    'click button'(event, instance) {
        // increment the counter when button is clicked
        var canvas = document.getElementById('mycanvas');
        canvas.setAttribute('width', 400);
        canvas.setAttribute('height', 300);
        context = canvas.getContext('2d');
        context.fillStyle = 'green';
        context.fillRect(10, 10, 200, 200);
        instance.counter.set(instance.counter.get() + 1);
    },
});
