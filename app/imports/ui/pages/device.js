Template.device.helpers({
    w = weather.find().fetch();
    'name': function(){
        return w[0].devices[0].name;
    },
    'power': function(){
    return w[0].devices[0].power;
}
});