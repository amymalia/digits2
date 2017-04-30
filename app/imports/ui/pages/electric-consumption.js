/**
 * Created by mike3 on 4/29/2017.
 */
import { Template } from 'meteor/templating';

$(document).ready(function(){
    // the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered
    //$('.modal-trigger').leanModal();
    //$('.modal1').modal();

});

Template.Electric_Consumption_Page.onRendered(function onRendered() {
   // $(document).ready(function(){
        // the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered
     //   $('.modal').modal();
    //});
});
//name
//time--> minutes
//power usage
//let device1 = {"Lab", 60, 2000};
//let device2 = {"Small Appliance", 90, 500};
//let device3 = {"Large Appliance", 30, 1000};

Template.Electric_Consumption_Page.helpers({

    addDevice: function(name, power, time){

    },



});
