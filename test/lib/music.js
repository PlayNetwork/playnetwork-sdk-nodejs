/*eslint no-magic-numbers: 0*/
/*eslint no-unused-expressions: 0*/
var
	chai = require('chai'),
	co = require('co'),
	nock = require('nock'),

	MusicProxy = require('../../lib/music'),

	should = chai.should();


describe('music', () => {
	'use strict';

	let
		ensureAuthHeaders = new Promise((resolve, reject) => {
			return resolve({
				'x-client-id': 'test',
				'x-authentication-token': 'test'
			})
		}),
		music,
		requestInfo,
		responseInfo;

	afterEach(() => {
		requestInfo = undefined;
		responseInfo = undefined;
	});

	beforeEach(() => {
		music = new MusicProxy(null, ensureAuthHeaders);

		// capture request and response info
		music.on('request', (info) => (requestInfo = info));
		music.on('response', (info) => (responseInfo = info));
	});

	describe('ctor', () => {
		it('should properly construct', () => {
			let
				proxy1 = new MusicProxy({
					host : 'one'
				}),
				proxy2 = new MusicProxy({
					host : 'two'
				});

			proxy1.settings().host.should.not.equal(proxy2.settings().host);
		});

		it('should be constructable without options...', () => {
			let proxy = new MusicProxy();
			proxy.settings().should.not.be.empty;
			should.exist(proxy.settings().host);
			should.exist(proxy.settings().secure);
		});

		it('should be constructable with options...', () => {
			let
				options = {
					host : 'develop-test-api.apps.playnetwork.com',
					secure : true
				},
				proxy = new MusicProxy(options);

			should.exist(proxy.allBroadcasts);
			should.exist(proxy.allCollections);
			should.exist(proxy.allStations);
			should.exist(proxy.getBroadcast);
			should.exist(proxy.getCollection);
			should.exist(proxy.getStation);
			should.exist(proxy.mixCollection);
			should.exist(proxy.settings);
			proxy.settings().should.not.be.empty;
			proxy.settings().host.should.equal(options.host);
			proxy.settings().secure.should.equal(options.secure);
		});
	});

	describe('#addPlaylistTracks', () => {
		let mockTracks = [{
			legacy : {
				trackToken : 12345
			}
		}, {
			assetId : 'test'
		}];

		it('should require playlistId', (done) => {
			music.addPlaylistTracks()
				.then(() => {
					return done(new Error('should require playlistId'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('playlistId is required');

					return done();
				})
		});

		it('should require tracks', (done) => {
			music.addPlaylistTracks('test', function (err, result) {
				should.not.exist(result);
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('tracks are required');

				return done();
			});
		});

		it('should require all tracks have identifier', (done) => {
			music.addPlaylistTracks(
				'test',
				mockTracks.concat([{ test : true }]),
				function (err, result) {
					console.log(err);
					should.not.exist(result);
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('track at index 2 is missing identifier');

					return done();
				});
		});

		it('should properly create playlist (promise)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.post('/v2/playlists/test/tracks')
				.reply(201, mockTracks);

			music.addPlaylistTracks('test', mockTracks)
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly create playlist (callback)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.post('/v2/playlists/test/tracks')
				.reply(201, mockTracks);

			music.addPlaylistTracks('test', mockTracks, function (err, result) {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});
	});

	describe('#allBroadcasts', () => {
		it('should require stationId', (done) => {
			music.allBroadcasts(function (err, result) {
				should.not.exist(result);
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('stationId is required');

				return done();
			});
		});

		it('should properly retrieve all broadcasts (promise)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get('/v2/stations/test/broadcasts')
				.reply(200, { total : 0 });

			music.allBroadcasts('test')
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly retrieve all broadcasts (callback)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get('/v2/stations/test/broadcasts')
				.reply(200, { total : 0 });

			music.allBroadcasts('test', function (err, result) {
				should.not.exist(err);
				should.exist(requestInfo);

				return done();
			});
		});

		it('should properly support query filters', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get(/\/v2\/stations\/test\/broadcasts[.]*/)
				.reply(200, { total : 0 });

			music.allBroadcasts(
				'test',
				{
					filters : {
						mandatory : {
							exists : 'broadcastId'
						}
					}
				}).then((result) => {
					should.exist(result);
					should.exist(requestInfo);
					should.exist(requestInfo.query);
					should.exist(requestInfo.query['filters[mandatory][exists]']);
					requestInfo.query['filters[mandatory][exists]'].should.equal('broadcastId');

					return done();
				}).catch((err) => (done(err)));
		});
	});

	describe('#allCollections', () => {
		it('should properly retrieve all collections (promise)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get('/v2/collections')
				.reply(200, { total : 0 });

			music.allCollections()
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly retrieve all collections (callback)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get('/v2/collections')
				.reply(200, { total : 0 });

			music.allCollections(function (err, result) {
				should.not.exist(err);
				should.exist(requestInfo);

				return done();
			});
		});

		it('should properly support query filters', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get(/\/v2\/collections[.]*/)
				.reply(200, { total : 0 });

			music.allCollections({
				filters : {
					mandatory : {
						exact : {
							'legacy.trackToken' : 12345
						}
					}
				}
			}).then((result) => {
				should.exist(result);
				should.exist(requestInfo);
				should.exist(requestInfo.query);
				should.exist(requestInfo.query['filters[mandatory][exact][legacy.trackToken]']);
				requestInfo.query['filters[mandatory][exact][legacy.trackToken]'].should.equal(12345);

				return done();
			}).catch((err) => (done(err)));
		});
	});

	describe('#allCollectionTracks', () => {
		it('should require collectionId', (done) => {
			music.allCollectionTracks(function (err, result) {
				should.not.exist(result);
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('collectionId is required');

				return done();
			});
		});

		it('should properly retrieve all collection tracks (promise)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get('/v2/collections/test/tracks')
				.reply(200, { total : 0 });

			music.allCollectionTracks('test')
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly retrieve all collection tracks (callback)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get('/v2/collections/test/tracks')
				.reply(200, { total : 0 });

			music.allCollectionTracks('test', function (err, result) {
				should.not.exist(err);
				should.exist(requestInfo);

				return done();
			});
		});
	});

	describe('#allPlaylists', () => {
		it('should properly retrieve all playlists (promise)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get('/v2/playlists')
				.reply(200, { total : 0 });

			music.allPlaylists()
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly retrieve all playlists (callback)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get('/v2/playlists')
				.reply(200, { total : 0 });

			music.allPlaylists(function (err, result) {
				should.not.exist(err);
				should.exist(requestInfo);

				return done();
			});
		});

		it('should properly support query filters', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get(/\/v2\/playlists[.]*/)
				.reply(200, { total : 0 });

			music.allPlaylists({
				filters : {
					mandatory : {
						gte : {
							'trackCount' : 100
						}
					}
				}
			}).then((result) => {
				should.exist(result);
				should.exist(requestInfo);
				should.exist(requestInfo.query);
				should.exist(requestInfo.query['filters[mandatory][gte][trackCount]']);
				requestInfo.query['filters[mandatory][gte][trackCount]'].should.equal(100);

				return done();
			}).catch((err) => (done(err)));
		});
	});

	describe('#allPlaylistTracks', () => {
		it('should require playlistId', (done) => {
			music.allPlaylistTracks(function (err, result) {
				should.not.exist(result);
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('playlistId is required');

				return done();
			});
		});

		it('should properly retrieve all playlist tracks (promise)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get('/v2/playlists/test/tracks')
				.reply(200, { total : 0 });

			music.allPlaylistTracks('test')
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly retrieve all playlist tracks (callback)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get('/v2/playlists/test/tracks')
				.reply(200, { total : 0 });

			music.allPlaylistTracks('test', function (err, result) {
				should.not.exist(err);
				should.exist(requestInfo);

				return done();
			});
		});
	});

	describe('#allStations', () => {
		it('should properly retrieve all stations (promise)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get('/v2/stations')
				.reply(200, { total : 0 });

			music.allStations()
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly retrieve all stations (callback)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get('/v2/stations')
				.reply(200, { total : 0 });

			music.allStations(function (err, result) {
				should.not.exist(err);
				should.exist(requestInfo);

				return done();
			});
		});

		it('should properly support query filters', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get(/\/v2\/stations[.]*/)
				.reply(200, { total : 0 });

			music.allStations({
				filters : {
					mandatory : {
						exact : {
							'legacy.playlistToken' : 12345
						}
					}
				}
			}).then((result) => {
				should.exist(result);
				should.exist(requestInfo);
				should.exist(requestInfo.query);
				should.exist(requestInfo.query['filters[mandatory][exact][legacy.playlistToken]']);
				requestInfo.query['filters[mandatory][exact][legacy.playlistToken]'].should.equal(12345);

				return done();
			}).catch((err) => (done(err)));
		});
	});

	describe('#allStationTracks', () => {
		it('should require stationId', (done) => {
			music.allStationTracks(function (err, result) {
				should.not.exist(result);
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('stationId is required');

				return done();
			});
		});

		it('should properly retrieve all station tracks (promise)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get('/v2/stations/test/tracks')
				.reply(200, { total : 0 });

			music.allStationTracks('test')
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly retrieve all station tracks (callback)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get('/v2/stations/test/tracks')
				.reply(200, { total : 0 });

			music.allStationTracks('test', function (err, result) {
				should.not.exist(err);
				should.exist(requestInfo);

				return done();
			});
		});
	});

	describe('#createBroadcast', () => {
		it('should require stationId', (done) => {
			music.createBroadcast()
				.then(() => {
					return done(new Error('should require stationId'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('stationId is required');

					return done();
				})
		});

		it('should properly create broadcast (promise)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.post('/v2/stations/test/broadcasts')
				.reply(200, { broadcastId : 'test' });

			music.createBroadcast('test')
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly create broadcast (callback)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.post('/v2/stations/test/broadcasts')
				.reply(200, { broadcastId : 'test' });

			music.createBroadcast('test', function (err, result) {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});
	});

	describe('#createPlaylist', () => {
		let mockPlaylist = {
			title : 'test playlist'
		};

		it('should require playlist details', (done) => {
			music.createPlaylist()
				.then(() => {
					return done(new Error('should require playlist'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('playlist is required');

					return done();
				})
		});

		it('should require title', (done) => {
			music.createPlaylist({ other : true }, function (err, result) {
				should.not.exist(result);
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('playlist title is required');

				return done();
			});
		});

		it('should properly create playlist (promise)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.post('/v2/playlists')
				.reply(200, mockPlaylist);

			music.createPlaylist(mockPlaylist)
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly create playlist (callback)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.post('/v2/playlists')
				.reply(200, mockPlaylist);

			music.createPlaylist(mockPlaylist, function (err, result) {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});
	});

	describe('#deleteBroadcast', () => {
		it('should require stationId', (done) => {
			music.deleteBroadcast()
				.then(() => {
					return done(new Error('should require stationId'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('stationId is required');

					return done();
				})
		});

		it('should require broadcastId', (done) => {
			music.deleteBroadcast('test')
				.then(() => {
					return done(new Error('should require broadcastId'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('broadcastId is required');

					return done();
				})
		});

		it('should properly delete broadcast (promise)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.delete('/v2/stations/test/broadcasts/test')
				.reply(204);

			music.deleteBroadcast('test', 'test')
				.then(() => {
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly delete broadcast (callback)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.delete('/v2/stations/test/broadcasts/test')
				.reply(204);

			music.deleteBroadcast('test', 'test', function (err) {
				should.not.exist(err);
				should.exist(requestInfo);

				return done();
			});
		});
	});

	describe('#deletePlaylist', () => {
		it('should require playlistId', (done) => {
			music.deletePlaylist()
				.then(() => {
					return done(new Error('should require playlistId'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('playlistId is required');

					return done();
				})
		});

		it('should properly delete playlist (promise)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.delete('/v2/playlists/test')
				.reply(204);

			music.deletePlaylist('test')
				.then(() => {
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly delete playlist (callback)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.delete('/v2/playlists/test')
				.reply(204);

			music.deletePlaylist('test', function (err) {
				should.not.exist(err);
				should.exist(requestInfo);

				return done();
			});
		});
	});

	describe('#getBroadcast', () => {
		it('should require stationId', (done) => {
			music.getBroadcast()
				.then(() => {
					return done(new Error('should require stationId'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('stationId is required');

					return done();
				})
		});

		it('should require broadcastId', (done) => {
			music.getBroadcast('test')
				.then(() => {
					return done(new Error('should require broadcastId'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('broadcastId is required');

					return done();
				})
		});

		it('should properly retrieve broadcast (promise)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get('/v2/stations/test/broadcasts/test')
				.reply(200, { total : 0 });

			music.getBroadcast('test', 'test')
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly retrieve broadcast (callback)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get('/v2/stations/test/broadcasts/test')
				.reply(200, { total : 0 });

			music.getBroadcast('test', 'test', function (err, result) {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});
	});

	describe('#getCollection', () => {
		it('should require collectionId', (done) => {
			music.getCollection()
				.then(() => {
					return done(new Error('should require collectionId'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('collectionId is required');

					return done();
				})
		});

		it('should properly retrieve collection (promise)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get('/v2/collections/test')
				.reply(200, { total : 0 });

			music.getCollection('test')
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly retrieve collection (callback)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get('/v2/collections/test')
				.reply(200, { total : 0 });

			music.getCollection('test', function (err, result) {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});
	});

	describe('#getPlaylist', () => {
		it('should require playlistId', (done) => {
			music.getPlaylist()
				.then(() => {
					return done(new Error('should require playlistId'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('playlistId is required');

					return done();
				})
		});

		it('should properly retrieve collection (promise)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get('/v2/playlists/test')
				.reply(200, { total : 0 });

			music.getPlaylist('test')
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly retrieve playlist (callback)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get('/v2/playlists/test')
				.reply(200, { total : 0 });

			music.getPlaylist('test', function (err, result) {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});
	});

	describe('#getStation', () => {
		it('should require stationId', (done) => {
			music.getStation()
				.then(() => {
					return done(new Error('should require stationId'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('stationId is required');

					return done();
				})
		});

		it('should properly retrieve station (promise)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get('/v2/stations/test')
				.reply(200, { total : 0 });

			music.getStation('test')
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly retrieve station (callback)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get('/v2/stations/test')
				.reply(200, { total : 0 });

			music.getStation('test', function (err, result) {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});
	});

	describe('#mixStation', () => {
		it('should require collectionId', (done) => {
			music.mixCollection()
				.then(() => {
					return done(new Error('should require collectionId'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('collectionId is required');

					return done();
				})
		});

		it('should properly retrieve collection (promise)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get('/v2/collections/test/mix')
				.reply(200, { total : 0 });

			music.mixCollection('test')
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly retrieve collection (callback)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get('/v2/collections/test/mix')
				.reply(200, { total : 0 });

			music.mixCollection('test', function (err, result) {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});
	});
});
