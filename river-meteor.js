Tweets = new Mongo.Collection("tweets");

if (Meteor.isClient) {
  // counter starts at 0
  /*
  Session.setDefault('counter', 0);

  Template.hello.helpers({
    counter: function () {
      return Session.get('counter');
    }
  });

  Template.hello.events({
    'click button': function () {
      // increment the counter when button is clicked
      Session.set('counter', Session.get('counter') + 1);
    }
  });
  */
  
	Template.body.helpers({
		tweets: function () {
			return Tweets.find({}, {sort: {created_at: -1}});
		}
	}); 
  
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    Tweets.remove({});
    Tweets.insert({
		river_user: 'warcode', 
		twitter_data : { 
			id_str : '1234',
			user : {
				name : '',
				screen_name : '',
				profile_image_url_https : ''
			},
			text : 'hello',
			created_at : '2015-01-01'
		}
	});
  });
}
