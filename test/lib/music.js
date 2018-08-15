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
		ensureAuthHeaders = function () {
			return new Promise((resolve, reject) => {
				return resolve({
					'x-client-id': 'test',
					'x-authentication-token': 'test'
				})
			})
		},
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
					agent : { proxy : true },
					host : 'develop-test-api.apps.playnetwork.com',
					maxRetries : 1,
					port : 8080,
					rejectUnauthorized : true,
					secure : true
				},
				proxy = new MusicProxy(options);

			should.exist(proxy.allBroadcasts);
			should.exist(proxy.allCollections);
			should.exist(proxy.allStations);
			should.exist(proxy.findBroadcastsByStationId);
			should.exist(proxy.getBroadcast);
			should.exist(proxy.getCollection);
			should.exist(proxy.getStation);
			should.exist(proxy.mixCollection);
			should.exist(proxy.settings);
			should.exist(proxy.updateBroadcast);
			proxy.settings().should.not.be.empty;
			proxy.settings().agent.should.equal(options.agent);
			proxy.settings().host.should.equal(options.host);
			proxy.settings().port.should.equal(options.port);
			proxy.settings().rejectUnauthorized.should.equal(options.rejectUnauthorized);
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

		it('should require playlistId (promise)', (done) => {
			music.addPlaylistTracks()
				.then(() => {
					return done(new Error('should require playlistId'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('playlistId is required');

					return done();
				});
		});

		it('should require playlistId (callback)', (done) => {
			music.addPlaylistTracks(function (err, result) {
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('playlistId is required');
				should.not.exist(result);

				return done();
			});
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
					should.not.exist(result);
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('track at index 2 is missing identifier');

					return done();
				});
		});

		it('should properly convert track to an array', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.post('/v2/playlists/test/tracks')
				.reply(201, mockTracks);

			music.addPlaylistTracks('test', mockTracks[0])
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
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

	describe('#allTracks', () => {
		it('should properly retrieve all tracks (promise)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get('/v2/tracks')
				.reply(200, { total : 0 });

			music.allTracks()
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly retrieve all tracks (callback)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get('/v2/tracks')
				.reply(200, { total : 0 });

			music.allTracks(function (err, result) {
				should.not.exist(err);
				should.exist(requestInfo);

				return done();
			});
		});

		it('should properly support query filters', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get(/\/v2\/tracks[.]*/)
				.reply(200, { total : 0 });

			music.allTracks({
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

	describe('#call', () => {
		beforeEach(() => {
			// override ensureAuthHeaders
			music.ensureAuthHeaders = function () {
				return new Promise((resolve, reject) => {
					return resolve({
						'x-client-id': 'test',
						'x-authentication-token': 'test'
					})
				})
			};
		});

		it('should require options (callback)', (done) => {
			music.call(function (err, result) {
				should.exist(err);
				should.exist(err.message);
				err.message.should.equal('options are required');
				should.not.exist(result);

				return done();
			});
		});

		it('should require options (promise)', (done) => {
			music
				.call()
				.then(() => done(new Error('should require options')))
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.equal('options are required');

					return done();
				});
		});

		it('should require options.pathname (callback)', (done) => {
			music.call({ method : 'get' }, function (err, result) {
				should.exist(err);
				should.exist(err.message);
				err.message.should.equal('options.pathname is required');
				should.not.exist(result);

				return done();
			});
		});

		it('should require options.pathname (promise)', (done) => {
			music
				.call({ method : 'get' })
				.then(() => done(new Error('should require options.pathname')))
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.equal('options.pathname is required');

					return done();
				});
		});

		it('should default options.method (callback)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get('/v0/test')
				.reply(200, { test : true });

			music.call({ pathname : '/v0/test' }, function (err, result) {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});

		it('should default invalid options.method (promise)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get('/v0/test')
				.reply(200, { test : true });

			music
				.call({ pathname : '/v0/test', method : { invalid : true } })
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch(done);
		});

		it('should lowercase options.method (promise)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.put('/v0/test')
				.reply(202, { test : true });

			music
				.call({ pathname : '/v0/test', method : 'PUT' })
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch(done);
		});

		it('should accept options.data', (done) => {
			let data = { test : true };

			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.post('/v0/test', data)
				.reply(201, data);

			music
				.call({ pathname : '/v0/test', method : 'POST', data : data })
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch(done);
		});
	});

	describe('#checkPlaylistTrack', () => {
		it('should require playlistId (promise)', (done) => {
			music.checkPlaylistTrack()
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

		it('should require playlistId (callback)', (done) => {
			music.checkPlaylistTrack(function (err, result) {
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('playlistId is required');
				should.not.exist(result);

				return done();
			});
		});

		it('should require track', (done) => {
			music.checkPlaylistTrack('test', function (err, result) {
				should.not.exist(result);
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('track is required');

				return done();
			});
		});

		it('should require track to have identifier', (done) => {
			music.checkPlaylistTrack(
				'test',
				{ test : true },
				function (err, result) {
					should.not.exist(result);
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('track is missing identifier');

					return done();
				});
		});

		it('should properly check playlist track (promise)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.head('/v2/playlists/test/tracks/test')
				.reply(200);

			music.checkPlaylistTrack('test', 'test')
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);
					result.should.be.true;

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly check playlist track (callback)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.head('/v2/playlists/test/tracks/test')
				.reply(404);

			music.checkPlaylistTrack(
				'test',
				{ assetId : 'test' },
				function (err, result) {
					should.not.exist(err);
					should.exist(result);
					should.exist(requestInfo);
					result.should.be.false;

					return done();
				});
		});

		it('should properly check playlist track by legacy trackToken', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.head('/v2/playlists/test/tracks/tracktoken:12345')
				.reply(200);

			music.checkPlaylistTrack('test', { legacy : { trackToken : 12345 }})
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});
	});

	describe('#createBroadcast', () => {
		it('should require stationId (promise)', (done) => {
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

		it('should require stationId (callback)', (done) => {
			music.createBroadcast(function (err, result) {
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('stationId is required');
				should.not.exist(result);

				return done();
			});
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

		it('should require playlist details (promise)', (done) => {
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

		it('should require playlist details (callback)', (done) => {
			music.createPlaylist(function (err, result) {
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('playlist is required');
				should.not.exist(result);

				return done();
			});
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
		it('should require stationId (promise)', (done) => {
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

		it('should require stationId (callback)', (done) => {
			music.deleteBroadcast(function (err, result) {
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('stationId is required');
				should.not.exist(result);

				return done();
			});
		});

		it('should require broadcastId (promise)', (done) => {
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

		it('should require broadcastId (callback)', (done) => {
			music.deleteBroadcast('test', function (err, result) {
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('broadcastId is required');
				should.not.exist(result);

				return done();
			});
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
		it('should require playlistId (promise)', (done) => {
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

		it('should require playlistId (callback)', (done) => {
			music.deletePlaylist(function (err, result) {
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('playlistId is required');
				should.not.exist(result);

				return done();
			});
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

	describe('#deletePlaylistTrack', () => {
		it('should require playlistId (promise)', (done) => {
			music.deletePlaylistTrack()
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

		it('should require playlistId (callback)', (done) => {
			music.deletePlaylistTrack(function (err, result) {
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('playlistId is required');
				should.not.exist(result);

				return done();
			});
		});

		it('should require track', (done) => {
			music.deletePlaylistTrack('test', function (err, result) {
				should.not.exist(result);
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('track is required');

				return done();
			});
		});

		it('should require track to have identifier', (done) => {
			music.deletePlaylistTrack(
				'test',
				{ test : true },
				function (err, result) {
					should.not.exist(result);
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('track is missing identifier');

					return done();
				});
		});

		it('should properly check playlist track (promise)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.delete('/v2/playlists/test/tracks/test')
				.reply(200);

			music.deletePlaylistTrack('test', 'test')
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
				.delete('/v2/playlists/test/tracks/test')
				.reply(200);

			music.deletePlaylistTrack(
				'test',
				{ assetId : 'test' },
				function (err, result) {
					should.not.exist(err);
					should.exist(result);
					should.exist(requestInfo);

					return done();
				});
		});

		it('should properly check playlist track by legacy trackToken', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.delete('/v2/playlists/test/tracks/tracktoken:12345')
				.reply(200);

			music.deletePlaylistTrack('test', { legacy : { trackToken : 12345 }})
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});
	});

	describe('#findBroadcastsByStationId', () => {
		it('should require stationId (promise)', (done) => {
			music.findBroadcastsByStationId()
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

		it('should require stationId (callback)', (done) => {
			music.findBroadcastsByStationId(function (err, result) {
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('stationId is required');
				should.not.exist(result);

				return done();
			});
		});

		it('should properly retrieve broadcast (promise)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get('/v2/stations/test/broadcasts')
				.reply(200, { total : 0 });

			music.findBroadcastsByStationId('test')
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
				.get('/v2/stations/test/broadcasts')
				.reply(200, { total : 0 });

			music.findBroadcastsByStationId('test', function (err, result) {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});
	});

	describe('#getBroadcast', () => {
		it('should require stationId (promise)', (done) => {
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

		it('should require stationId (callback)', (done) => {
			music.getBroadcast(function (err, result) {
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('stationId is required');
				should.not.exist(result);

				return done();
			});
		});

		it('should require broadcastId (promise)', (done) => {
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

		it('should require broadcastId (callback)', (done) => {
			music.getBroadcast('test', function (err, result) {
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('broadcastId is required');
				should.not.exist(result);

				return done();
			});
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
		it('should require collectionId (promise)', (done) => {
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

		it('should require collectionId (callback)', (done) => {
			music.getCollection(function (err, result) {
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('collectionId is required');
				should.not.exist(result);

				return done();
			});
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
		it('should require playlistId (promise)', (done) => {
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

		it('should require playlistId (callback)', (done) => {
			music.getPlaylist(function (err, result) {
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('playlistId is required');
				should.not.exist(result);

				return done();
			});
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
		it('should require stationId (promise)', (done) => {
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

		it('should require stationId (callback)', (done) => {
			music.getStation(function (err, result) {
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('stationId is required');
				should.not.exist(result);

				return done();
			});
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

	describe('#getTrack', () => {
		it('should require trackAlias (promise)', (done) => {
			music.getTrack()
				.then(() => {
					return done(new Error('should require trackAlias'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('trackAlias is required');

					return done();
				})
		});

		it('should require trackAlias (callback)', (done) => {
			music.getTrack(function (err, result) {
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('trackAlias is required');
				should.not.exist(result);

				return done();
			});
		});

		it('should properly retrieve track (promise)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get('/v2/tracks/test')
				.reply(200, { total : 0 });

			music.getTrack('test')
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly retrieve track (callback)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get('/v2/tracks/test')
				.reply(200, { total : 0 });

			music.getTrack('test', function (err, result) {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});
	});

	describe('#getTracks', () => {
		let mockTracks = [{
			legacy : {
				trackToken : 12345
			}
		}, {
			assetId : 'test'
		}];

		it('should require tracks (callback)', (done) => {
			music.getTracks(function (err, result) {
				should.not.exist(result);
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('tracks are required');

				return done();
			});
		});

		it('should require all tracks have identifier', (done) => {
			music.getTracks(
				[{ test : true }, { test : true }],
				function (err, result) {
					should.not.exist(result);
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('tracks are required');

					return done();
				});
		});

		it('should convert one track to array (promise)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.post('/v2/tracks/trackIds')
				.reply(201, mockTracks);

			music.getTracks(mockTracks[0])
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly get multiple tracks (promise)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.post('/v2/tracks/trackIds')
				.reply(201, mockTracks);

			music.getTracks(mockTracks)
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly get multiple tracks (callback)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.post('/v2/tracks/trackIds')
				.reply(201, mockTracks);

			music.getTracks(mockTracks, function (err, result) {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});
	});

	describe('#mixStation', () => {
		it('should require collectionId (promise)', (done) => {
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

		it('should require collectionId (callback)', (done) => {
			music.mixCollection(function (err, result) {
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('collectionId is required');
				should.not.exist(result);

				return done();
			});
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

	describe('#updateBroadcast', () => {
		let mockBroadcast = {
			stationId : 'test'
		};

		it('should require stationId (promise)', (done) => {
			music.updateBroadcast()
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

		it('should require broadcast (promise)', (done) => {
			music.updateBroadcast('test')
				.then(() => {
					return done(new Error('should require broadcast'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('broadcast is required');

					return done();
				})
		});

		it('should require stationId (callback)', (done) => {
			music.updateBroadcast(function (err, result) {
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('stationId is required');
				should.not.exist(result);

				return done();
			});
		});

		it('should properly update broadcast (promise)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.put('/v2/stations/test/broadcasts')
				.reply(202, mockBroadcast);

			music.updateBroadcast('test', mockBroadcast)
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly update broadcast (callback)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.put('/v2/stations/test/broadcasts')
				.reply(202, mockBroadcast);

			music.updateBroadcast('test', mockBroadcast, function (err, result) {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});
	});

	describe('#updatePlaylist', () => {
		let mockPlaylist = {
			playlistId : 'test'
		};

		it('should require playlist details (promise)', (done) => {
			music.updatePlaylist()
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

		it('should require playlist details (callback)', (done) => {
			music.updatePlaylist(function (err, result) {
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('playlist is required');
				should.not.exist(result);

				return done();
			});
		});

		it('should require playlistId', (done) => {
			music.updatePlaylist({ other : true }, function (err, result) {
				should.not.exist(result);
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('playlistId is required');

				return done();
			});
		});

		it('should properly update playlist (promise)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.put('/v2/playlists/test')
				.reply(200, mockPlaylist);

			music.updatePlaylist(mockPlaylist)
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch((err) => (done(err)));
		});

		it('should properly update playlist (callback)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.put('/v2/playlists/test')
				.reply(200, mockPlaylist);

			music.updatePlaylist(mockPlaylist, function (err, result) {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});
	});

	describe('#upsertCollections', () => {
		let mockCollection = {
			collectionId : 'test'
		};

		it('should require collection details (promise)', (done) => {
			music.upsertCollections()
				.then(() => {
					return done(new Error('should require collections'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('collections are required');

					return done();
				})
		});

		it('should require collection details (callback)', (done) => {
			music.upsertCollections(function (err, result) {
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('collections are required');
				should.not.exist(result);

				return done();
			});
		});

		it('should require collectionId or legacy identifiers', (done) => {
			music.upsertCollections({ other : true }, function (err, result) {
				should.not.exist(result);
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('collectionId or legacy identifiers are required');

				return done();
			});
		});

		it('should validate all collections in an array', (done) => {
			music.upsertCollections([mockCollection, { other : true }], function (err, result) {
				should.not.exist(result);
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('collection 1 of 2');
				err.message.should.contain('collectionId or legacy identifiers are required');

				return done();
			});
		});

		it('should properly upsert collection (promise)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.put('/v2/collections')
				.reply(200, mockCollection);

			music.upsertCollections({
					legacy : {
						programToken : 1,
						version : 'test'
					}
				})
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch(done);
		});

		it('should properly upsert collection (callback)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.put('/v2/collections')
				.reply(200, mockCollection);

			music.upsertCollections(mockCollection, function (err, result) {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});
	});

	describe('#upsertStations', () => {
		let mockStation = {
			stationId : 'test'
		};

		it('should require station details (promise)', (done) => {
			music.upsertStations()
				.then(() => {
					return done(new Error('should require stations'));
				})
				.catch((err) => {
					should.exist(err);
					should.exist(err.message);
					err.message.should.contain('stations are required');

					return done();
				})
		});

		it('should require station details (callback)', (done) => {
			music.upsertStations(function (err, result) {
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('stations are required');
				should.not.exist(result);

				return done();
			});
		});

		it('should require stationId or legacy identifiers', (done) => {
			music.upsertStations({ other : true }, function (err, result) {
				should.not.exist(result);
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('stationId or legacy identifiers are required');

				return done();
			});
		});

		it('should validate all stations in an array', (done) => {
			music.upsertStations([mockStation, { other : true }], function (err, result) {
				should.not.exist(result);
				should.exist(err);
				should.exist(err.message);
				err.message.should.contain('station 1 of 2');
				err.message.should.contain('stationId or legacy identifiers are required');

				return done();
			});
		});

		it('should properly upsert station (promise)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.put('/v2/stations')
				.reply(200, mockStation);

			music.upsertStations({
					legacy : {
						programToken : 1,
						version : 'test'
					}
				})
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch(done);
		});

		it('should properly upsert collection (callback)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.put('/v2/stations')
				.reply(200, mockStation);

			music.upsertStations(mockStation, function (err, result) {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});
	});

	describe('#version', () => {
		it('should properly return version (promise)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get(/\/v[0-9]{1}\/version/i)
				.reply(200, { version : 'test' });

			music.version()
				.then((result) => {
					should.exist(result);
					should.exist(requestInfo);

					return done();
				})
				.catch(done);
		});

		it('should properly return version (callback)', (done) => {
			// intercept outbound request
			nock('https://curio-music-api.apps.playnetwork.com')
				.get(/\/v[0-9]{1}\/version/i)
				.reply(200, { version : 'test' });

			music.version(function (err, result) {
				should.not.exist(err);
				should.exist(result);
				should.exist(requestInfo);

				return done();
			});
		});
	});
});
