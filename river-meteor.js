Tweets = new Mongo.Collection("tweets");

MessageLimit = 300;

if (Meteor.isClient) {
  UpdateTitleMessage = function(){};
  UnreadCount = 0;

  Meteor.subscribe('Tweets');
  Meteor.subscribe('users');
  Session.set("RiverTitle", "River");

  moment().format();

  Template.body.helpers({
    tweets: function() {
      Meteor.call('Timeline', function(err, response) {});
      return Tweets.find({
        river_user: Meteor.userId()
      }, {
        sort: [
          ["createdAt", "desc"]
        ],
        limit: MessageLimit
      });
    },
    isRetweet: function() {
      if ('undefined' !== typeof this.twitter_data.retweeted_status) {
        return true;
      }
      return false;
    },
    isNotification: function() {
      if('undefined' !== typeof this.Notification)
      {
        return true;
      }
    }
  });

  Template.debug.helpers({
    asJSON: function() {
      return JSON.stringify(this.twitter_data)
    }
  });

  Template.tweet.helpers({
    formatTwitterDate: function() {
      return moment(this.twitter_data.created_at, "ddd MMM DD HH:mm:ss ZZ YYYY").format("ddd MMM DD HH:mm:ss YYYY");
    },
    formatTwitterTimestamp: function() {
      return moment(this.twitter_data.created_at, "ddd MMM DD HH:mm:ss ZZ YYYY").format("X");
    },
    autolinkTwitterMessage: function() {
      return twttr.txt.autoLink(this.twitter_data.text, {
        urlEntities: this.twitter_data.entities.urls
      });
    },
    embeddedImage: function() {
      if ('undefined' !== typeof this.twitter_data.entities) {
        if ('undefined' !== typeof this.twitter_data.entities.media) {
          if ('undefined' !== typeof this.twitter_data.entities.media[0]) {
            if ('undefined' !== typeof this.twitter_data.entities.media[0].media_url_https) {
              return this.twitter_data.entities.media[0].media_url_https;
            }
          }
        }
      }
      return false;
    }
  });

  Template.retweet.helpers({
    formatTwitterDate: function() {
      return moment(this.twitter_data.created_at, "ddd MMM DD HH:mm:ss ZZ YYYY").format("ddd MMM DD HH:mm:ss YYYY");
    },
    formatTwitterTimestamp: function() {
      return moment(this.twitter_data.created_at, "ddd MMM DD HH:mm:ss ZZ YYYY").format("X");
    },
    autolinkTwitterMessage: function() {
      return twttr.txt.autoLink(this.twitter_data.retweeted_status.text, {
        urlEntities: this.twitter_data.retweeted_status.entities.urls
      });
    },
    embeddedImage: function() {
      if ('undefined' !== typeof this.twitter_data.retweeted_status) {
        if ('undefined' !== typeof this.twitter_data.retweeted_status.entities) {
          if ('undefined' !== typeof this.twitter_data.retweeted_status.entities.media) {
            if ('undefined' !== typeof this.twitter_data.retweeted_status.entities.media[0]) {
              if ('undefined' !== typeof this.twitter_data.retweeted_status.entities.media[0].media_url_https) {
                return this.twitter_data.retweeted_status.entities.media[0].media_url_https;
              }
            }
          }
        }
      }
      return false;
    }
  });

  Template.welcome.helpers({
    formatTwitterDate: function() {
      var now = new Date();
      return moment(now).format("ddd MMM DD HH:mm:ss YYYY");
    },
    formatTwitterTimestamp: function() {
      var now = new Date();
      return moment(now).format("X");
    }
  });

  Template.notification.helpers({
    formatTwitterDate: function() {
      var now = new Date();
      return moment(now).format("ddd MMM DD HH:mm:ss YYYY");
    },
    formatTwitterTimestamp: function() {
      var now = new Date();
      return moment(now).format("X");
    }
  });

  Template.notification.onRendered(function() {
    //Update title
    UpdateTitleMessage();

    //fade in latest tweet
    var element = this.find('.tweet');
    $('.tweet').finish();
    $(element).fadeIn();

    //scroll fixed
    if ($(window).scrollTop() > 98) {
      $(window).scrollTop($(window).scrollTop() + 98);
    }

  });

  Template.tweet.onRendered(function() {
    //Update title
    UpdateTitleMessage();

    //Align image horizontally
    var imageEmbed = this.find('.tweet .embedContainer a img.embedImage');
    if (imageEmbed) {
      $(imageEmbed).imagesLoaded(function() {
        $(imageEmbed).css('margin-top', -(($(imageEmbed).height() - 253) / 2));
      });
    }

    //fade in latest tweet
    var element = this.find('.tweet');
    $('.tweet').finish();
    $(element).fadeIn();

    //scroll fixed
    if ($(window).scrollTop() > 98) {
      $(window).scrollTop($(window).scrollTop() + 98);
    }

  });

  Template.retweet.onRendered(function() {
    //Align image horizontally
    var imageEmbed = this.find('.tweet .embedContainer a img.embedImage');
    if (imageEmbed) {
      $(imageEmbed).imagesLoaded(function() {
        $(imageEmbed).css('margin-top', -(($(imageEmbed).height() - 253) / 2));
      });
    }

    //fade in latest tweet
    var element = this.find('.tweet');
    $('.tweet').finish();
    $(element).fadeIn();

    //scroll fixed
    if ($(window).scrollTop() > 98) {
      $(window).scrollTop($(window).scrollTop() + 98);
    }
  });

  Template.body.onRendered(function() {

    $(window).bind("blur", function() {
      UpdateTitleMessage = function(){
        UnreadCount++;
        var titleString = '('+UnreadCount+') River';
        Session.set("RiverTitle", titleString);
      };
      $('.last-unread').removeClass('last-unread');
      var last_unread = $("#stream .tweet:first");
      last_unread.addClass('last-unread');
    });

    $(window).bind("focus", function() {
      UnreadCount = 0;
      UpdateTitleMessage = function(){};
      var last_unread = $('.last-unread');
      if (last_unread) {
        if (last_unread.offset().top > $(window).height()) {
          $('#last-read-control').show();
        }
      }
      Session.set("RiverTitle", "River");
    });

  });

  Deps.autorun(function(){
    document.title = Session.get("RiverTitle");
  });

  Template.body.events({
    'click .keyword-button': function() {
      console.log('keywords started');
      //var keyword = '#hots,#CSGO,#twitch,#dreamhack';
      var keyword = $('.keyword-input').val();
      Meteor.call('Keyword', keyword, function(err, response) {
        console.log('keywords: ' + keyword);
      });
    },
    'click .reset-button': function() {
      Meteor.call('Reset', function(err, response) {
        console.log('reset performed');
      });
    }
  });


  Template.menubox.events({
    'click .river-login-button': function() {
      Meteor.loginWithTwitter({
        loginStyle: "redirect"
      });
    },
    'click #write-control': function() {
      $('#msgbox').slideToggle(250);
    }
  });

  Template.msgbox.events({
    'input #status': function() {
      var count = 140 - $('#status').val().length;
      $('.characters').html(count.toString());
    },
    'click .msgbox-sendbutton': function() {
      var message = $("textarea#status").val();
      Meteor.call('Send', message, function(err, response) {
        $('#msgbox').slideToggle(250);
        $("textarea#status").val('');
        $('.characters').html('140');
      });
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

  TwitterStreams = {};
  KeywordStreams = {};

  Meteor.startup(function() {
    // code to run on server at startup

    Accounts.loginServiceConfiguration.remove({
      service: 'twitter'
    });

    Accounts.loginServiceConfiguration.insert({
      service: 'twitter',
      consumerKey: Meteor.settings.twitter.key,
      secret: Meteor.settings.twitter.secret
    });

    //Tweets.remove({});

  });

  Meteor.methods({
    Timeline: function() {

      if (Meteor.user() === 'undefined' || Meteor.user() === null) {
        return;
      }

      var currentUser = Meteor.user()._id;

      twitterClient = new TwitMaker({
        consumer_key: Meteor.settings.twitter.key,
        consumer_secret: Meteor.settings.twitter.secret,
        access_token: Meteor.users.findOne({
          _id: Meteor.userId()
        }).services.twitter.accessToken,
        access_token_secret: Meteor.users.findOne({
          _id: Meteor.userId()
        }).services.twitter.accessTokenSecret
      });


      if (Meteor.user().services.twitter && Tweets.find({
          river_user: currentUser,
          twitter_data: {$exists : true}
        }).count() == 0) {

        twitterClient.get('statuses/home_timeline', {
          count: 50
        }, Meteor.bindEnvironment(function(err, data, resp) {
          if (err) {
            console.log(err);
          }
          if (data) {
            for (i = 0; i < data.length; i++) {
              Tweets.insert({
                river_user: currentUser,
                twitterId: data[i].id_str,
                isDeleted: false,
                createdAt: data[i].created_at,
                twitter_data: data[i]
              /* TODO: prune this to only required fields to save space */
              /*{
                  id_str : element.id_str,
                  user : {
                      name : element.user.name,
                      screen_name : element.user.screen_name,
                      profile_image_url_https : element.user.profile_image_url_https
                  },
                  text : element.text,
                  created_at : element.created_at,
                  entities : {
                      urls: element.entities.urls,
                      media : element.media
                  },
                  retweeted_status : (retweet ? element.retweeted_status : null)
              }*/
              });
            }
          }
        }));
      }

      if (Meteor.user().services.twitter && (TwitterStreams[currentUser] === null || 'undefined' === typeof TwitterStreams[currentUser])) {

        TwitterStreams[currentUser] = twitterClient.stream('user', {
          with: 'followings'
        });

        TwitterStreams[currentUser].on('tweet', Meteor.bindEnvironment(function(tweet) {
          Tweets.insert({
            river_user: currentUser,
            twitterId: tweet.id_str,
            isDeleted: false,
            createdAt: tweet.created_at,
            twitter_data: tweet
          });

        }));


        TwitterStreams[currentUser].on('delete', Meteor.bindEnvironment(function(deleteMessage) {
          var tid = deleteMessage.delete.status.id_str;
          Tweets.update({
            river_user: currentUser,
            twitterId: tid
          }, {
            $set: {
              isDeleted: true
            }
          });
        }));

        TwitterStreams[currentUser].on('disconnect', Meteor.bindEnvironment(function(disconnectMessage) {
          Tweets.insert({
            river_user: currentUser,
            isDeleted: false,
            Notification: "You were disconnected from twitter: " + disconnectMessage
          });
          TwitterStreams[currentUser] = null;
        }));
      }
    },
    Send: function(message) {
      twitterClient = new TwitMaker({
        consumer_key: Meteor.settings.twitter.key,
        consumer_secret: Meteor.settings.twitter.secret,
        access_token: Meteor.users.findOne({
          _id: Meteor.userId()
        }).services.twitter.accessToken,
        access_token_secret: Meteor.users.findOne({
          _id: Meteor.userId()
        }).services.twitter.accessTokenSecret
      });

      twitterClient.post('statuses/update', {
        status: message
      }, function(err, data, response) {});
    },
    Keyword: function(keyword) {

      if (Meteor.user() === 'undefined' || Meteor.user() === null) {
        return;
      }

      var currentUser = Meteor.user()._id;

      if (Meteor.user().services.twitter) {

        if (keyword === '') {
          KeywordStreams[currentUser].stop();
          KeywordStreams[currentUser] = null;
          return;
        }

        twitterClient = new TwitMaker({
          consumer_key: Meteor.settings.twitter.key,
          consumer_secret: Meteor.settings.twitter.secret,
          access_token: Meteor.users.findOne({
            _id: Meteor.userId()
          }).services.twitter.accessToken,
          access_token_secret: Meteor.users.findOne({
            _id: Meteor.userId()
          }).services.twitter.accessTokenSecret
        });

        //filter level can be set it none, low or medium
        //none is all messages, low and medium lets twitter filter for "message importance" where medium is the strongest filter
        KeywordStreams[currentUser] = twitterClient.stream('statuses/filter', {
          track: keyword,
          language: 'en',
          filter_level: 'none'
        });

        KeywordStreams[currentUser].on('tweet', Meteor.bindEnvironment(function(tweet) {
          //ignore retweets in keyword streams as they are a major source of duplicates
          if ('undefined' === typeof tweet.retweeted_status || tweet.retweeted_status === null) {
            Tweets.insert({
              river_user: currentUser,
              twitterId: tweet.id_str,
              isDeleted: false,
              createdAt: tweet.created_at,
              twitter_data: tweet
            });
          }
        }));

        KeywordStreams[currentUser].on('delete', Meteor.bindEnvironment(function(deleteMessage) {
          var tid = deleteMessage.delete.status.id_str;
          Tweets.update({
            river_user: currentUser,
            twitterId: tid
          }, {
            $set: {
              isDeleted: true
            }
          });
        }));

        KeywordStreams[currentUser].on('disconnect', Meteor.bindEnvironment(function(disconnectMessage) {
          KeywordStreams[currentUser] = null;
        }));

        return true;
      }
    },
    Reset: function() {
      if (Meteor.user() === 'undefined' || Meteor.user() === null) {
        return;
      }

      var currentUser = Meteor.user()._id;

      Tweets.remove({
        river_user: currentUser
      });

      TwitterStreams[currentUser].stop();
      TwitterStreams[currentUser] = null;

      Tweets.insert({
        river_user: currentUser,
        isDeleted: false,
        Notification: "Tweet purge complete. Restarting stream."
      });

      Meteor.call('Timeline', function(err, response) {});

      return true;
    }
  });

  Meteor.publish('Tweets', function() {
    return Tweets.find({
      river_user: this.userId
    }, {
      sort: [
        ["createdAt", "desc"]
      ],
      limit: MessageLimit
    });
  });

  Meteor.publish('users', function() {
    return Meteor.users.find({
      _id: this.userId
    });
  });

}