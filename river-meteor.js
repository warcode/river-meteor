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
	
	Template.menubox.events({
      'click .river-login-button' : function() {
        Meteor.loginWithTwitter({ loginStyle: "redirect" });
      }
    });
	
	/*
    Template.user.events({
      'click #signOut' : function() {
        Meteor.logout();
      }
    });
    */
  
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
	
	Accounts.loginServiceConfiguration.remove({
		service : 'twitter'
	});

	Accounts.loginServiceConfiguration.insert({
		service     : 'twitter',
		consumerKey : Meteor.settings.twitter.key,
		secret      : Meteor.settings.twitter.secret
	});
    
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
