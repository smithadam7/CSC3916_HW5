const Movie          =  require( "./movie" );
const Review        =  require( "./review" );
var   jwt            =  require( 'jsonwebtoken' );

exports.getReviews =
	( req , res ) =>
	{
		// Query Database
		Review.find(
			req.query,
			( err , review ) =>
			{
				if ( err )
				{
					res.status( 500 ).send( err );
				}
				res.status(200).send( review );
			});
	};
	
exports.postReview = 
	async function( req , res )
	{
		// Get token from request header
		// "JWT " + token
		token = req.headers.authorization.substr(4);
		decoded = jwt.verify(token, process.env.SECRET_KEY);
		
		// Validate that Review has Associated Movie
		if ( !req.body.movieTitle )
		{
			res.status( 500 ).send( { msg : 'movieTitle validation failed' } );
		}
		// Validate Reviewer Field
		else if ( !req.body.reviewer || req.body.reviewer != decoded.username )
		{
			res.status( 500 ).send( { msg : 'Reviewer validation failed' } );
		}
		// Validate Quote Field
		else if ( !req.body.quote || req.body.quote == '' )
		{
			res.status( 500 ).send( { msg : 'Quote validation failed' } );
		}
		// Validate Rating Field
		else if ( !req.body.rating || isNaN(req.body.rating) || ( req.body.rating < 0 || req.body.rating > 5 ) )
		{
			res.status( 500 ).send( { msg : 'Rating validation failed' } );
		}
		// All Validation Successful
		else
		{
			// Validate that Reviewed Movie Exists
			movie = await Movie.findOne( { title : req.body.movieTitle } );
			
			// No Associated Movie Found so show error
			if ( !movie )
			{
				res.status( 500 ).send( { msg : 'That Movie Does Not Exist' } );
			}
			// Otherwise Save Review
			else
			{
				// Prepare Review Model for Saving
				let review  =  new Review({
											movieTitle :  req.body.movieTitle,
											reviewer   :  req.body.reviewer,
											quote      :  req.body.quote,
											rating     :  req.body.rating
										});
				review.save(
						( err , review ) =>	
						{
							if( err )
							{
								res.status( 500 ).send( err );
							}
							res.status( 200 ).send({
													success : true,
													msg     : "Review Successfully Posted"
												});
						});
			}
		}
	};