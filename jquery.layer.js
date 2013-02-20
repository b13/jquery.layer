/**
 * layer plugin
 *
 * (c) 2013 b:dreizehn, Germany
 * Author: Daniel Sattler
 *
 * This plugin provides an easy way to include a fullscreen layer on a website.
 *
 * The content of the layer is loaded via ajax. The url for the ajax request can 
 * be stored inside the "data-layercontenturl" attribute of the element or passed throw
 * this plugin over the "ajaxUrl" option.
 *
 * Make sure to setup the right width over the "layerWidth" option on init the plugin.
 * This is important to center the layer. Your customized styling for the layer has to be done 
 * in your own css - start with styling your layer at the wrapping div of your layer content 
 * (which is loaded over ajax), also give this div a background-color.
 *
 *
 * HOOKS:
 * To extend the plugin the following hooks are available:
 * 
 *  "open"   : before layer will be opened
 *  "opened" : after layer is opened
 *  "close"  : before layer will be closed
 *  "closed" : after the layer is closed
 *
 * the hooks can be used like this:
 *
 * $(elem).on('open', function() {
 *   // do some stuff before the layer will be opened
 * });
 *
 */


;(function($, window, document, undefined) {

	$.layer = function(el, options) {
		var 
			me      = this
			,opts   = {}
			,isOpen = false

			,$container   = ''
			,$layer       = ''
			,$bg          = ''
			,$loadingGif  = '';


			// initialization function; private
		me.init = function() {

				// store DOM element and jQuery object for later use
			me.el = el;
			me.$el = $(el);

				// merge the options
			opts = me.options = $.extend({}, $.layer.defaults, options);

			me.createHtml();

			return me;
		};




			// create html for layer
			// store reference to each layer html element for later use
		me.createHtml = function() {

			$layer       = $('#' + opts.layerID);
			$bg          = $('#' + opts.layerBgID);
			$loadingGif  = $('#' + opts.loadingGifID);
			$container   = $('#' + opts.layerContainerID);
			
			if ($container.length == 0) {

					// container setup
				$('body').append("<div id='" + opts.layerContainerID + "'></div>");
				$container = $('#' + opts.layerContainerID);
				$container.hide().css(opts.css.layerContainerID);


					// layer setup
				$container.append("<div id='" + opts.layerID + "'></div>");
				$layer = $('#' + opts.layerID);
				$layer.hide().css(opts.css.layerID);


					// loading gif setup
				if (opts.showLoadingGif) {
					$container.append("<div id='" + opts.loadingGifID + "'><img src='" + opts.pathToLoadingGif + "'></div>");
					$loadingGif = $('#' + opts.loadingGifID);
					$loadingGif.hide().css(opts.css.loadingGifID);
				}
			}
			
			if ($bg.length == 0) {

					// background setup
				$('body').append("<div id='" + opts.layerBgID + "'></div>");
				$bg = $('#' + opts.layerBgID);
				$bg.hide().css(opts.css.layerBgID);
			}
		}




			// init events
		me.events = function() {

				// close layer by click on background
			$container.off('click').on('click', function(evt) {

					// don't close layer if user clicked on layerbox
				if ($(this).find(evt.target).length == 0) {
						// trigger close hook
					me.$el.trigger('close');
					me.closeLayer();
				}
			});


				// bind event for close btn inside the layer
			$('.' + opts.closeLayerClassName).off('click').on('click', function(evt) {
				evt.preventDefault();

					// trigger close hook
				me.$el.trigger('close');
				me.closeLayer();
			});
		}



			// get ajax content
		me.getAjaxContent = function(callback) {

			if (opts.ajaxUrl.length > 0) {
				var url = opts.ajaxUrl;
			} else {
				var url = me.$el.data(opts.dataNameForAjaxUrl);
			}

				// do ajax request
			$.ajax({
				url: url
				,cache: false
			}).done(function(data) {

				me.loadingGif.hide();

				$layer.append(data);
				me.layer.show();

					// trigger opened hook
				me.$el.trigger('opened');
				if (callback) { callback(this); }

			}).fail(function() {
				console.log("fail to load ajax content");
			});
		};




		/*
		 *  show/hide elements
		 */


			// background
		me.background = {

			settings: {
				bodyStyle: ''	
			}

			,show: function (callback) {
				var me = this;

					// store inline style body tag
				me.settings.bodyStyle = $('body').attr('style');
				$('body').css({
					'position' : 'relative'
					,'overflow': 'hidden'
				});

				$bg.show();

				if (callback) { callback(this); }
			}
			
			,hide: function (callback) {
				var me = this;

					// restore inline style body tag
				$('body').removeAttr('style').attr('style', me.settings.bodyStyle);

				$bg.hide();

				if (callback) { callback(this); }
			}
		}



	
			// loading gif
		me.loadingGif = {
			
			show: function (callback) {
				$loadingGif.show();
				if (callback) { callback(this); }
			}
			
			,hide: function (callback) {
				$loadingGif.hide();
				if (callback) { callback(this); }
			}
		}



			// layer 
		me.layer = {
			
			show: function (callback) {
				$layer.css({
					'width': opts.layerWidth
					,'margin-left' : '-' + opts.layerWidth / 2 + 'px'
				})
				
				$layer.show();
				if (callback) { callback(this); }
			}
			
			,hide: function (callback) {
				$layer.hide();
				if (callback) { callback(this); }
			}
		}



			// container
		me.container = {
			
			show: function (callback) {
				$container.show();
				if (callback) { callback(this); }
			}
			
			,hide: function (callback) {
				$container.hide();
				if (callback) { callback(this); }
			}
		}




		/*
		 * Public API
		 *
		 * this functions are called to trigger the layer
		 *
		 */

		 	// close Layer
		 me.closeLayer = function () {
			
			me.container.hide();
			me.background.hide();
			me.loadingGif.hide();
			me.layer.hide();

				// remove old layer content
			$layer.children().remove();

			isOpen = false;

				// trigger closed hook
			me.$el.trigger('closed');
		}



			// open layer
		me.openLayer = function () {

				// take care that just on layer can be opened
			if (isOpen) { return; } 
			isOpen = true;
			
				// trigger open hook
			me.$el.trigger('open');

				// init events
			me.events();
			
			me.container.show();
			me.background.show();

			if (opts.showLoadingGif) {
				me.loadingGif.show();
			}
			
				// get layer content
			me.getAjaxContent();
		}



			// initialize ourself
		me.init();
	};



		//default options
	$.layer.defaults = {

			// settings
		showLoadingGif        : true
		,pathToLoadingGif     : "/typo3conf/templates/main/img/ajax-loader.gif"
		,closeLayerClassName  : "amazingLayer-close" // class name for close layer action
		,dataNameForAjaxUrl   : 'layercontenturl' // get url for layer content from data-layercontenturl
		,ajaxUrl              : "" // if a url is set, the plugin loads the layer content from this url
		,layerWidth           : '600' // set with for layer

			// ID's
		,layerContainerID : "amazingLayer-container"
		,layerID          : "amazingLayer-box"
		,layerBgID        : "amazingLayer-bg"
		,loadingGifID     : "amazingLayer-loadingGif"


			// CSS settings
		,css: {
			layerContainerID : {
				'position'  : 'fixed'
				,'top'      : '0px'
			 	,'right'    : '0px'
			 	,'bottom'   : '0px'
			 	,'left'     : '0px'
			 	,'z-index'  : '99995'
			 	,'overflow' : 'scroll'
			 }
			 ,loadingGifID : {
				'position' : 'absolute' 
				,'left'    : '50%' 
				,'top'     : '50%'
				,'z-index' : '99999' 
			}
			,layerID: {
				'position' : 'absolute'
				,'left'    : '50%'
			}
			,layerBgID : {
	 			'position'   : 'fixed'
	 			,'top'       : '0px'
	 			,'right'     : '0px'
	 			,'bottom'    : '0px'
	 			,'left'      : '0px'
	 			,'z-index'   : '99990'
	 			,'opacity'   : '0.7'
	 			,'background': 'black'
			}
		}

	};



	$.fn.layer = function(options) {
		return this.each(function () {
			var 
				$this = $(this)
				,data = $this.data('layer');

			if (!data) {

				$this.data('layer', (data = new $.layer(this, options)));

			} else {

					// public api can be used after the plugin is initialized
				switch (options) {
					
						// open layer $.layer("open")
					case "open":
						data.openLayer();
					break;
					
						// close layer $.layer("close")
					case "close":
						data.closeLayer();
					break;
				}
			}
		});
	};
	
})(jQuery, window, document);