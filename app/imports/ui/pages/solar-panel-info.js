import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';


Template.Solar_Panel_Info.onRendered(function onRendered() {

    $('.ui.dropdown')
        .dropdown()
    ;

    $('.dropdown-button').dropdown({
            inDuration: 300,
            outDuration: 225,
            constrainWidth: false, // Does not change width of dropdown to that of the activator
            hover: true, // Activate on hover
            gutter: 0, // Spacing from edge
            belowOrigin: false, // Displays dropdown below the button
            alignment: 'left', // Displays dropdown with edge aligned to the left of button
            stopPropagation: false // Stops event propagation
        }
    );


});


Template.Solar_Panel_Info.helpers({


});

Template.Solar_Panel_Info.onCreated(function onCreated() {
    this.autorun(() => {

    });


});

Template.Solar_Panel_Info.events({});

