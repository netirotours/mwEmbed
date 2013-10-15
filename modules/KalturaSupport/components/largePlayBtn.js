( function( mw, $ ) {"use strict";

	// Todo: support "visible" attribute to show/hide button on player state change
	mw.PluginManager.add( 'largePlayBtn', mw.KBaseComponent.extend({
		//indicates we were explicitly asked to show the button (will be used when re-enabling the button)
		shouldShow : false,
		isDisabled: false,
		defaultConfig: {
			'parent': 'videoHolder',
			'order': 1
		},
		isSafeEnviornment: function(){
			return !(mw.getConfig( 'EmbedPlayer.WebKitPlaysInline') && mw.isIphone());
		},
		setup: function() {
			this.addBindings();
		},
		/**
		 * Checks if the play button should stay on screen during playback,
		 * cases where a native player is dipalyed such as iPhone.
		 */
		isPersistantPlayBtn: function(){
			return mw.isAndroid2() || this.getPlayer().isLinkPlayer() || 
					( mw.isIphone() && mw.getConfig( 'EmbedPlayer.iPhoneShowHTMLPlayScreen' ) );
		},
		/**
		 * Checks if a large play button should be displayed on the
		 * otherwise native player
		 */
		useLargePlayBtn: function(){
			if( this.isPersistantPlayBtn() ){
				return true;
			}
			// If we are using native controls return false:
			return !this.getPlayer().useNativePlayerControls();
		},
		addBindings: function() {
			var _this = this;
			this.bind('showInlineDownloadLink', function(e, linkUrl){
				_this.getComponent().attr({
					'href': linkUrl,
					'target': '_blank'
				});
			});
			this.bind('onChangeMediaDone playerReady onpause onEndedDone', function(){
				_this.showButton();
			});
			this.bind('playing AdSupport_StartAdPlayback', function(){
				_this.hideButton();
			});
			this.bind('onPlayerStateChange', function(e, newState, oldState){
				if( newState == 'load' ){
					_this.hideButton();
				}
				if( newState == 'pause' && _this.getPlayer().isPauseLoading ){
					_this.hideButton();
				}
			});
		},
		showButton: function(){
			if ( !this.isDisabled ) {
				this.showComponent();
			}
			this.shouldShow = true;
		},
		hideButton: function(){
			this.hideComponent();
			this.shouldShow = false;
		},
		hideComponent: function() {
			if( !this.isPersistantPlayBtn() ) {
				this.getComponent().hide();
			}
		},
		showComponent: function() {
			if( this.useLargePlayBtn() ) {
				this.getComponent().show();
			}
		},
		clickButton: function( event ){
			// If link player, only trigger events
			if( this.getPlayer().isLinkPlayer() ) {
				this.getPlayer().triggerHelper( 'firstPlay' ); // To send stats event for play
				this.getPlayer().triggerHelper( 'playing' );
				return;
			}

			event.preventDefault();
			this.getPlayer().sendNotification('doPlay');
		},
		onEnable: function(){
			this.isDisabled = false;
			if ( this.shouldShow ) {
				this.showComponent();
			}
		},
		onDisable: function(){
			this.isDisabled = true;
			this.hideComponent();
		},
		getComponent: function() {
			var _this = this;
			if( !this.$el ) {
				this.$el = $( '<a />' )
							.attr( {
								'tabindex': '-1',
								'href' : '#',
								'title' : gM( 'mwe-embedplayer-play_clip' ),
								'class'	: "icon-play" + this.getCssClass()
							} )
							.hide()
							// Add play hook:
							.click( function(e) {
								_this.clickButton(e);
							} );		
			}
			return this.$el;
		}
	})
	);

} )( window.mw, window.jQuery );