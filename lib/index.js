var
	AssetProxy = require('./asset'),
	ClaimProxy = require('./claim'),
	ContentProxy = require('./content'),
	DeviceProxy = require('./device'),
	KeyProxy = require('./key'),
	LocationProxy = require('./location'),
	MusicProxy = require('./music'),
	PlaybackProxy = require('./playback'),
	PlayerProxy = require('./player'),
	ProvisionProxy = require('./provision'),
	RelationshipProxy = require('./relationship'),
	SettingsProxy = require('./settings'),
	validation = require('./validation');


module.exports = (function (self) {
	'use strict';

	self.configure = (clientId, secret, options) => {
		// handle scenario when options are supplied as first argument
		if (validation.isEmpty(options) && validation.isEmpty(secret)) {
			options = clientId;
			clientId = undefined;
		}

		// default options if necessary
		if (validation.isEmpty(options)) {
			options = {};
		}

		let key = new KeyProxy(options.key, clientId, secret);

		// construct each PlayNetwork API proxy
		self.asset = new AssetProxy(options.asset, key.ensureAuthHeaders);
		self.claim = new ClaimProxy(options.claim, key.ensureAuthHeaders);
		self.content = new ContentProxy(options.content, key.ensureAuthHeaders);
		self.device = new DeviceProxy(options.device, key.ensureAuthHeaders);
		self.key = key;
		self.location = new LocationProxy(options.location, key.ensureAuthHeaders);
		self.music = new MusicProxy(options.music, key.ensureAuthHeaders);
		self.playback = new PlaybackProxy(options.playback, key.ensureAuthHeaders);
		self.player = new PlayerProxy(options.player, key.ensureAuthHeaders);
		self.provision = new ProvisionProxy(options.provision, key.ensureAuthHeaders);
		self.relationship = new RelationshipProxy(options.relationship, key.ensureAuthHeaders);
		self.settings = new SettingsProxy(options.settings, key.ensureAuthHeaders);

		// create a mechanism to retrieve configured options
		self.options = () => ({
			claim : self.claim.settings(),
			content : self.content.settings(),
			device : self.device.settings(),
			key : self.key.settings(),
			location : self.location.settings(),
			music : self.music.settings(),
			playback : self.playback.settings(),
			player : self.player.settings(),
			provision : self.provision.settings(),
			settings : self.settings.settings()
		});
	};

	return self;
}({}));
