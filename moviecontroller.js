//Movie Controller with HW4 requirements : movie reviews
const Movie  =  require( "./movie" );
exports.getMovies =
	async function( req , res )
	{
		reviews = req.query.reviews;
		// If the request desires reviews, aggregate query for reviews too
		if (reviews && reviews.toLowerCase()=='true')
		{
			// Prepare Query
			query = req.query;
			delete query.reviews;
			
			movies = await Movie.aggregate([
											{
												$match:		query
											},
											{
												$lookup:	{
																from         : 'reviews',
																localField   : 'title',
																foreignField : 'movieTitle',
																as           : 'reviews'
															}
											},
											{
												$project:	{
																title: 1,
																actors: 2,
																yearReleased:3,
																genre:4,
																reviews:'$reviews'
															}
											}
										]);
			res.status( 200 ).send( movies );
		}			
		// If reviews are not desired, only query movies
		else
		{
			// Prepare Query
			query = req.query;
			delete query.reviews;
			
			// Query Database
			Movie.find(
				req.query,
				( err , movie ) =>
				{
					if ( err )
					{
						res.status( 500 ).send( err );
					}
					res.status(200).send( movie );
				});
		}
	};
	
exports.postMovie = 
	( req , res ) =>
	{
		// validate that all fields exist
		if ( !req.body.title )
		{
			res.status( 400 ).send({ msg: 'title is required' });
			return;
		}
		else if ( !req.body.yearReleased )
		{
			res.status( 400 ).send({ msg: 'year released is required' });
			return;
		}
		else if ( !req.body.genre || ! Movie.schema.path('genre').enumValues.includes(req.body.genre))
		{
			res.status( 400 ).send({ msg: 'genre is required', options: Movie.schema.path('genre').enumValues });
			return;
		}
		else if ( !req.body.actors || req.body.actors.length < 3)
		{
			res.status( 400 ).send({ msg: 'movie must have at least three actors' });
			return;
		}
		else if ( !req.body.actors.every(function(actor){return actor.actorName && actor.characterName;}) )
		{
			res.status( 400 ).send({ msg: 'actors must have a name and a character' });
			return;
		}
		else
		{
			// request data validated successfully, check if movie already exists
			Movie.findOne(
				{ title : req.body.title },
				( err , movie ) =>
				{
					if ( err )
					{
						req.status( 500 ).send( err );
						return;
					}
					else if ( movie )
					{
						res.status( 401 ).send( { msg : 'Movie with that tile already exists' } );
						return
					}
					else
					{
						toSave = new Movie({
											title        : req.body.title,
											yearReleased : req.body.yearReleased,
											genre        : req.body.genre,
											actors       : req.body.actors
										});
						toSave.save(
							( err , movie ) =>
							{
								if ( err )
								{
									res.status( 500 ).send( err );
									return;
								}
								res.status( 200 ).json({ 
															success : true, 
															msg     : "movie saved successfully"
														});
							});
					}
				});	
		}
	};
	
exports.putMovie = 
	( req , res ) =>
	{
		// validate that all fields exist
		if ( !req.body.title )
		{
			res.status( 400 ).send({ msg: 'title is required' });
			return;
		}
		else if ( !req.body.yearReleased )
		{
			res.status( 400 ).send({ msg: 'year released is required' });
			return;
		}
		else if ( !req.body.genre || ! Movie.schema.path('genre').enumValues.includes(req.body.genre))
		{
			res.status( 400 ).send({ msg: 'genre is required', options: Movie.schema.path('genre').enumValues });
			return;
		}
		else if ( !req.body.actors || req.body.actors.length < 3)
		{
			res.status( 400 ).send({ msg: 'movie must have at least three actors' });
			return;
		}
		else if ( !req.body.actors.every(function(actor){return actor.actorName && actor.characterName;}) )
		{
			res.status( 400 ).send({ msg: 'actors must have a name and a character' });
			return;
		}
		else
		{
			// request data validated successfully, check if movie already exists
			Movie.findOne(
				{ title : req.body.title },
				( err , movie ) =>
				{
					if ( err )
					{
						req.status( 500 ).send( err );
						return;
					}
					
					if ( movie )
					{
						movie.title         =  req.body.title;
						movie.yearReleased  =  req.body.yearReleased;
						movie.genre         = req.body.genre;
						movie.actors        =  req.body.actors;
						movie.save(
							( err , movie ) => 
							{
								if ( err )
								{
									res.status( 500 ).send( err );
									return;
								}
								res.status( 200 ).json({ 
															success : true,
															msg     : 'movie updated successfully'
													});
							});
						return
					}
					else
					{
						toSave = new Movie({
											title        : req.body.title,
											yearReleased : req.body.yearReleased,
											genre        : req.body.genre,
											actors       : req.body.actors
										});
						toSave.save(
							( err , movie ) =>
							{
								if ( err )
								{
									res.status( 500 ).send( err );
									return;
								}
								res.status( 200 ).json({ 
															success : true, 
															msg     : "movie added successfully"
														});
							});
					}
				});	
		}
	};
	
exports.deleteMovie =
	( req , res ) =>
	{
		if ( !req.body.title )
		{
			res.status( 401 ).send({ 
										success : false, 
										msg     : 'please include title of movie to delete'
									});
			return;
		}
		Movie.deleteOne(
			{ title : req.body.title },
			( err , movie) =>
			{
				if ( err )
				{
					res.status( 500 ).send( err );
					return;
				}
				res.status( 200 ).send({
											success : true,
											msg     : 'movie removed successfully'
										});
			});
	}