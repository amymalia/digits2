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


Template.Electric_Consumption_Page.helpers({

    sliderValue(deviceId) {
        const sliderData = document.getElementById(deviceId).value;
        return sliderData;
    },


    errorClass() {
        return Template.instance().messageFlags.get(displayErrorMessages) ? 'error' : '';
    },

});
