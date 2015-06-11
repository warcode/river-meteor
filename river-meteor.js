Tweets = new Mongo.Collection("tweets");

if (Meteor.isClient) {
	
	moment().format();
  
	Template.body.helpers({
		tweets: function () {
			if(Tweets.find({river_user: this.userId}).count() == 0) {
				Meteor.call('Timeline', function(err, response) {});
			}
			return Tweets.find({river_user: this.userId}, {sort: {created_at: -1}});
		}
	});
	
	Template.tweet.helpers({
		formatTwitterDate: function () {
			return moment(this.twitter_data.created_at, "ddd MMM DD HH:mm:ss ZZ YYYY").format("ddd MMM DD HH:mm:ss YYYY");
		},
		formatTwitterTimestamp: function () {
			return moment(this.twitter_data.created_at, "ddd MMM DD HH:mm:ss ZZ YYYY").format("X");
		},
		autolinkTwitterMessage: function () {
			return twttr.txt.autoLink(this.twitter_data.text, { urlEntities: this.twitter_data.entities.urls });
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
	
  });
  
  Meteor.methods({
	Timeline : function() {
		if(Meteor.user().services.twitter && Tweets.find({river_user: this.userId}).count() == 0)
		{
			twitterClient = new TwitMaker({
				consumer_key: Meteor.settings.twitter.key,
				consumer_secret: Meteor.settings.twitter.secret,
				access_token: Meteor.users.findOne({_id:Meteor.userId()}).services.twitter.accessToken,
				access_token_secret: Meteor.users.findOne({_id:Meteor.userId()}).services.twitter.accessTokenSecret
			});
			
			
			twitterClient.get('statuses/home_timeline', { count : 50}, Meteor.bindEnvironment(function(err, data, resp) {
					if (err) {
						console.log(err);
					}
					if(data) {
							data.forEach(function(element, index, array) {
								Tweets.insert({
									river_user: this.userId,
									isRetweet: (element.retweeted_status ? true : false),
									hasEmbeddedImage: (element.retweeted_status ? (element.retweeted_status.entities.media && element.retweeted_status.entities.media[0] ? true : false) : (element.entities.media && element.entities.media[0] ? true : false)),
									twitter_data : {
										id_str : element.id_str,
										user : {
											name : element.user.name,
											screen_name : element.user.screen_name,
											profile_image_url_https : element.user.profile_image_url_https
										},
										text : element.text,
										created_at : element.created_at,
										entities : {
											urls: element.entities.urls
										},
										retweeted_status : (element.retweeted_status ? retweeted_status : null) /* TODO: prune this to only required fields to save space */
									}
								});
							});
						
					}
					//store.set(user_token, data, 'EX', 60, redis.print);
			}));		
		}
		else
		{
			console.log('tweets already found');
		}
	}
	});
}
