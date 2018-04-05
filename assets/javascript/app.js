//array to store all the block objects in the mine_field container
var array_of_blocks = [];
var array_of_bombs = [];
var bomb_limit = 10;
//power up tracking
var clear_row_selected = false, 
	clear_row_used = false, 
	clear_column_selected = false, 
	clear_column_used = false, 
	reveal_bomb_used = false,
	add_time_used = false;
var dimension = 9;
var new_block_object = {
	block_state: "not_clicked",
	block_type: "",
	block_coordinate_x: 0,
	block_coordinate_y: 0,
	block_adyacent_empties: 0
};
var number_of_bombs = 0;
var number_of_empties = 0;
var number_of_flagged_blocks = 0;
var seconds = 5;

//field generation function
function generate_field() {
	//array of block types, coordinate variables, and temp_coordinates object
	var block_types = ["empty", "bomb"];
	// var index_x = 0, index_y = 0;
	var temp_coordinates = {
		"x": 0,
		"y": 0
	};
	
	var temp_block_type = "";

	//generate 81 blocks (9 x 9 grid)
	for (var i = 1; i < dimension + 1; i++) {
		//set temporary block coordinates (to be overwritten every iteration of block creation loop)
		array_of_blocks[i] = {};
		for (var j = 1; j < dimension + 1; j++) {
			temp_coordinates['x'] = i;
			temp_coordinates['y'] = j;
			//set temporary block type (will need some kind of algorithm to limit number of bombs
			//and make sure they are evenly spread throughout the field)
			// temp_block_type = block_types[Math.floor(Math.random() * block_types.length)];
			temp_block_type = "empty";
			//reference to the mine_field container
			var mine_field = $('.mine_field');
			//creating a new block element
			var new_block_div = $('<div>');

			//creating a new block object with default block_state and random block_type values
			new_block_object = {
				block_state: "not_clicked",
				block_type: temp_block_type,
				block_coordinate_x: temp_coordinates['x'],
				block_coordinate_y: temp_coordinates['y'],
				block_adyacent_empties: 0
			};

			//push new blocks object to array
			array_of_blocks[i][j] = new_block_object;

			//set data-state, data-type, class & id attributes, and background image of the new block element
			new_block_div
				.data('state', new_block_object.block_state)
				.data('type', new_block_object.block_type)
				.attr('id', `${temp_coordinates['x']}` + "-" + `${temp_coordinates['y']}`)
				.addClass('block')
				.css('background-image', `url(assets/images/${new_block_object.block_state}.png)`);

			//and append the new block element to the mine_field container
			mine_field.append(new_block_div);
		}
	}

	//plant bombs in the minefield
	plantBombs(array_of_blocks, number_of_bombs, bomb_limit);
}

//calculates distance searched from block clicked
function calculateDistance(block_id) {
	var block_index_x = block_id.charAt(0);
	var block_index_y = block_id.charAt(2);

	var block_empty = array_of_blocks[block_index_x][block_index_y];

	if (block_empty['block_type'] !== "bomb") {
		var empties = traverseBoard(block_empty, function(isBomb) {
			var bomb_type = isBomb['block_type'];
			//Non inverted boolean so true boolean representation
			return (!!(bomb_type === "bomb")) ? false : true;
		});

		if (empties.length > 0) {
			number_of_empties += empties.length + 1;
			block_empty['block_adyacent_empties'] = empties.length;
		}

		revealEmptyBlocks(empties);
		
//		if (number_of_empties === ((array_of_blocks.length - 1) * 9 - array_of_bombs.length)) {
//			alert('WIN');
//		}
	}
}

//reveals empty blocks adjacent to the block clicked
function revealEmptyBlocks(array_of_empties) {
	for (item of array_of_empties) {
		item['block_state'] = "clicked";
		
		$('#' + item['block_coordinate_x'] + '-' + item['block_coordinate_y'])
			.data('state', 'clicked')
			.css('background-image', `url(assets/images/${item.block_state}.png)`);
	};
};

//traverse the board
function traverseBoard(empty_block, isBomb) {
	var empty_blocks = [];

	isBomb = isBomb || function () {
		return true;
	};

	var temp_coordinate_x = empty_block['block_coordinate_x'];
	var temp_coordinate_y = empty_block['block_coordinate_y'];
	// traverse up
	if (temp_coordinate_x > 1 &&
		array_of_blocks[temp_coordinate_x - 1][temp_coordinate_y]['block_state'] !== "clicked" &&
		array_of_blocks[temp_coordinate_x - 1][temp_coordinate_y]['block_state'] !== "flagged") {
		empty_blocks.push(array_of_blocks[temp_coordinate_x - 1][temp_coordinate_y]);
	}

	// traverse down
	if (temp_coordinate_x <= dimension - 1 &&
		array_of_blocks[temp_coordinate_x + 1][temp_coordinate_y]['block_state'] !== "clicked" &&
		array_of_blocks[temp_coordinate_x + 1][temp_coordinate_y]['block_state'] !== "flagged") {
		empty_blocks.push(array_of_blocks[temp_coordinate_x + 1][temp_coordinate_y]);
	}

	// traverse left
	if (temp_coordinate_y > 1 &&
		array_of_blocks[temp_coordinate_x][temp_coordinate_y - 1]['block_state'] !== "clicked" &&
		array_of_blocks[temp_coordinate_x][temp_coordinate_y - 1]['block_state'] !== "flagged") {
		empty_blocks.push(array_of_blocks[temp_coordinate_x][temp_coordinate_y - 1]);
	}

	// traverse right
	if (temp_coordinate_y <= dimension - 1 &&
		array_of_blocks[temp_coordinate_x][temp_coordinate_y + 1]['block_state'] !== "clicked" &&
		array_of_blocks[temp_coordinate_x][temp_coordinate_y + 1]['block_state'] !== "flagged") {
		empty_blocks.push(array_of_blocks[temp_coordinate_x][temp_coordinate_y + 1]);
	}

	// traverse upper left
	if (temp_coordinate_x > 1 && temp_coordinate_y > 1 &&
		array_of_blocks[temp_coordinate_x - 1][temp_coordinate_y - 1]['block_state'] !== "clicked" &&
		array_of_blocks[temp_coordinate_x - 1][temp_coordinate_y - 1]['block_state'] !== "flagged") {
		empty_blocks.push(array_of_blocks[temp_coordinate_x - 1][temp_coordinate_y - 1]);
	}

	// traverse lower left
	if (temp_coordinate_x <= dimension - 1 && temp_coordinate_y > 1 &&
		array_of_blocks[temp_coordinate_x + 1][temp_coordinate_y - 1]['block_state'] !== "clicked" &&
		array_of_blocks[temp_coordinate_x + 1][temp_coordinate_y - 1]['block_state'] !== "flagged") {
		empty_blocks.push(array_of_blocks[temp_coordinate_x + 1][temp_coordinate_y - 1]);
	}

	// traverse upper right
	if (temp_coordinate_x > 1 && temp_coordinate_y <= dimension - 1 &&
		array_of_blocks[temp_coordinate_x - 1][temp_coordinate_y + 1]['block_state'] !== "clicked" &&
		array_of_blocks[temp_coordinate_x - 1][temp_coordinate_y + 1]['block_state'] !== "flagged") {
		empty_blocks.push(array_of_blocks[temp_coordinate_x - 1][temp_coordinate_y + 1]);
	}

	// traverse lower right
	if (temp_coordinate_x <= dimension - 1 && temp_coordinate_y <= dimension - 1 &&
		array_of_blocks[temp_coordinate_x + 1][temp_coordinate_y + 1]['block_state'] !== "clicked" &&
		array_of_blocks[temp_coordinate_x + 1][temp_coordinate_y + 1]['block_state'] !== "flagged") {
		empty_blocks.push(array_of_blocks[temp_coordinate_x + 1][temp_coordinate_y + 1]);
	}

	return $.grep(empty_blocks, isBomb);
}

//returns a random number
function getRandomNumber(max) {
	var num = Math.floor((Math.random() * 1000) + 1) % max;
	return (num === 0) ? getRandomNumber(max) : num; 
}

//plants bombs in the minefield
function plantBombs(array, bombsPlanted, limit) {
	var index_x, index_y;

	//while the number of bombs planted is under the limit
	while (bombsPlanted <= limit) {
		index_x = getRandomNumber(9);
		index_y = getRandomNumber(9);
		
		var temp_obj = array[index_x][index_y];
		
		//set appropriate data since that object/element became a bomb
		if (temp_obj.block_type !== "bomb") {
			temp_obj['block_type'] = "bomb";
			temp_obj['block_coordinate_x'] = index_x;
			temp_obj['block_coordinate_y'] = index_y;
			
			//search for specific coordinates
			$('#'+index_x + '-' + index_y).data('type',temp_obj.block_type);
			
			array[index_x][index_y] = temp_obj;
			array_of_bombs.push(temp_obj);
			
			bombsPlanted++;
		}
	}
}

//self-explanatory
function startGameTimer () {
	intervalId = setInterval(count, 1000);
}

function stopGameTimer(){
	clearInterval(intervalId)
}

//timer decrementation & associated checks/modifications
function count(){
	seconds--;
	
	var converted = fancyTimeFormat(seconds);
	
	$("#timerDisplay").text(converted);
	
	if (seconds === 0) {
		stopGameTimer();
		console.log("You Lose!");
		// gameOver();
		// $('#lossModal').modal('show');
		$('#winModal').modal('show');
		
		victory();
	}
}

//add time powerup
function add_time(){
	seconds += 30;
	
	$('.add_time').css('opacity', 0.25);
}

//formatting the time displayed
function fancyTimeFormat(time) {
	var hrs = ~~(time / 3600);
	var mins = ~~((time % 3600) / 60);
	var secs = time % 60;
	// Output like "1:01" or "4:03:59" or "123:03:59"
	var ret = "";
	
	if (hrs > 0) {
		ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
	}
	
	ret += "" + mins + ":" + (secs < 10 ? "0" : "");
	ret += "" + secs;
	
	return ret;
}

//power up that reveals a single bomb
function reveal_bomb() {
	//check to see if the power up has been used
	if (!reveal_bomb_used) {
		reveal_bomb_used = true;

		var found_one = false;

		//scan until an unflagged bomb has been found, then flag it
		$('.mine_field').children('.block').each(function () {
			if (!found_one && $(this).data('type') === "bomb" && $(this).data('state') != 'flagged') {
				found_one = true;

				$(this)
					.data('state', 'flagged')
					.css('background-image', 'url(assets/images/flagged.png)');
				
				$('.reveal_bomb').css('opacity', 0.25);
			}
		});
	}
}

//game over panel
function gameOver (){
	var queryURL = "https://api.giphy.com/v1/gifs/search?q=explosion&api_key=8SiJFznIRJb7dPaUfhjlnV6WeHfe66rt&limit=1";
	
	$.ajax({
		url: queryURL,
		method: "GET"
	}).then(function (response) {
		console.log(queryURL);
		console.log(response);
		
		var results = response.data;
		var bombImage = $("<img>");
		
		bombImage.attr("src", results[0].images.fixed_height.url);
		
		$("#gameOverAPI").append(bombImage);
	});
}

//victory panel
function victory (){
	var queryURL = "https://api.giphy.com/v1/gifs/search?q=party&api_key=8SiJFznIRJb7dPaUfhjlnV6WeHfe66rt&limit=1";
	
	$.ajax({
		url: queryURL,
		method: "GET"
	})
		.then(function (response) {
		console.log(queryURL);
		console.log(response);
		
		var results = response.data;
		var partyImage = $("<img>");
		
		partyImage.attr("src", results[0].images.fixed_height.url);
		
		$("#winAPI").append(partyImage);
	});
}

//for testing purposes (flags all bombs)
function autoRevealFlag(array_of_bombs) {
	for (item of array_of_bombs) {
		item['block_state'] = "flagged";
		
		$('#' + item['block_coordinate_x'] + '-' + item['block_coordinate_y'])
			.data('state', 'flagged')
			.css('background-image', `url(assets/images/${item.block_state}.png)`);
	};
};

//reset variables and UI states
function confirm_reset() {
	array_of_blocks = [];
	number_of_bombs = 0; //ten bombs
	number_of_empties = 0;
	bomb_limit = 10;
	number_of_flagged_blocks = 0;
	array_of_bombs = [];
	seconds = 120;
	clear_row_selected = false,
	clear_row_used = false,
	clear_column_selected = false,
	clear_column_used = false,
	reveal_bomb_used = false,
	add_time_used = false;
	dimension = 9;
	
	$('.mine_field').children().remove();
	$('.clear_row').css('opacity', 1);
	$('.clear_column').css('opacity', 1);
	$('.reveal_bomb').css('opacity', 1);
	$('.add_time').css('opacity', 1);
	
	generate_field();
	
	return confirm("GAME OVER click OK to start over again!");
}

//select clear method handles 'clear row' & 'clear column' power up data states
function select_clear(axis) {
	if (axis === 'row')
		if (!clear_row_used) {
			clear_row_used = true, clear_row_selected = true;
			
			$('.clear_row').css('opacity', 0.25);
		}

	if (axis === 'column')
		if (!clear_column_used) {
			clear_column_used = true, clear_column_selected = true;
			
			$('.clear_column').css('opacity', 0.25);
		}
}

//clear axis method handles UI state changes for 'clear row' & 'clear column' power ups
function clear_axis(index, comparison) {
	//for each element in the mine_field
	$('.mine_field').children('.block').each(function () {
		console.log(index, comparison);
		
		//check if the id's listed element coordinate matches that of the element that was clicked
		if ($(this).attr('id').charAt(index) === comparison) {
			//and if it's a bomb, flag it
			if ($(this).data('type') === "bomb") {
				$(this)
					.data('state', 'flagged')
					.css('background-image', 'url(assets/images/flagged.png)');
			} else {
				//otherwise, set it to be clicked
				$(this)
					.data('state', 'clicked')
					.css('background-image', 'url(assets/images/clicked.png)');
			}
		}
	});
}

//when a div with the class 'block' is clicked on
$(document).ready(function() {
	$("#timerDisplay").text("2:00");
	
	//for testing purposes (flags all bombs)
	$('.autoflag').on('click', function (event) {

		event.preventDefault();

		autoRevealFlag(array_of_bombs);
	});
	
	//set up timer functions
	$( ".mine_field" ).one( "click", function() { startGameTimer(); });

	$('body').on('mousedown', '.block', function(event) {
		switch (event.which) {
			case 1:
				//see if a click determined powerup is active
				if (clear_row_selected) {
					console.log($(this).attr('id').charAt(0));
					console.log($(this).attr('id').charAt(2));
					clear_axis(0, $(this).attr('id').charAt(0));
					clear_row_selected = false;
				} else if (clear_column_selected) {
					clear_axis(2, $(this).attr('id').charAt(2));
					clear_column_selected = false;
				} else {
					//if it was a left click and the clicked block's data-state attribute is 'not_clicked'
					if ($(this).data('state') === "not_clicked")
						//set its data-state attribute to 'clicked' and change the background image of the block
						$(this)
							.data('state', 'clicked')
							.css('background-image', 'url(assets/images/clicked.png)');

					//determine if block was a bomb or not
					if ($(this).data('type') === "bomb" && $(this).data('state') !== "flagged") {
						$(this)
							.data('state', 'clicked')
							.css('background-image', 'url(assets/images/bomb.png)');

						confirm_reset();
					} else if ($(this).data('type') === "empty") {
						calculateDistance($(this).attr('id'));
					}
				}
				break;
			case 2:
				//case for middle click (not used)
				console.log("your scroll wheel button has no use here");

				break;
			case 3:
				//if it was a right click and the clicked block's data-state attribute is 'not_clicked'
				if ($(this).data('state') === "not_clicked") {
					number_of_flagged_blocks++;

					//set its data-state attribute to 'flagged' and change the background image of the block
					$(this)
						.data('state', 'flagged')
						.css('background-image', 'url(assets/images/flagged.png)');
					
					new_block_object = {
						block_state: "flagged",
						block_type: "flagged",
						block_coordinate_x: $(this).attr('id').charAt(0),
						block_coordinate_y: $(this).attr('id').charAt(2),
						block_adyacent_empties: 0
					};
					
					array_of_blocks[new_block_object.block_coordinate_x][new_block_object.block_coordinate_y] = new_block_object;
				}
				//if the clicked block's data-state attribute is already 'flagged'
				else if ($(this).data('state') === "flagged") {
					number_of_flagged_blocks--;

					//set its data-state attribute to 'not_clicked' and change the background image
					$(this)
						.data('state', 'not_clicked')
						.css('background-image', 'url(assets/images/not_clicked.png)');
					
					new_block_object = {
						block_state: "not_clicked",
						block_type: "empty",
						block_coordinate_x: $(this).attr('id').charAt(0),
						block_coordinate_y: $(this).attr('id').charAt(2),
						block_adyacent_empties: 0
					};
					
					array_of_blocks[$(this).charAt(0)][$(this).charAt(2)] = new_block_object;
				}

				break;
			default:
				//default case (also not used)
				console("how'd you manage to see this message? what kind of mouse is that?");

		}
	});
});