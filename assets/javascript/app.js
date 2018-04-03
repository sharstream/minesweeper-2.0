//array to store all the block objects in the mine_field container
var array_of_blocks = [];
var number_of_bombs = 0;
var number_of_flagged_blocks = 0;
var block_bombs = [];
var seconds = 120;
//power up tracking
var clear_row_selected = false, 
	clear_row_used = false, 
	clear_column_selected = false, 
	clear_column_used = false, 
	reveal_bomb_used = false,
	add_time_used = false;

//field generation function
function generate_field() {
	//array of block types, coordinate variables, and temp_coordinates object
	var block_types = ["empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "bomb"];
	var index_x = 0, index_y = 0;
	var temp_coordinates = { "x": 0, "y": 0 };
	var temp_block_type = "";
	var number_of_bombs = 0;
	
	//reset power ups
	clear_row_selected = false, clear_row_used = false, clear_column_selected = false, clear_column_used = false, reveal_bomb_used = false, add_time_used = false;

	//generate 81 blocks (9 x 9 grid)
	for (var i = 1; i < 82; i++) {
		//set temporary block coordinates (to be overwritten every iteration of block creation loop)
		temp_coordinates['x'] = index_x + 1;
		temp_coordinates['y'] = index_y + 1;
		//set temporary block type (will need some kind of algorithm to limit number of bombs
		//and make sure they are evenly spread throughout the field)
		temp_block_type = block_types[Math.floor(Math.random() * block_types.length)];
		
		//determine frequency of bomb spawns
		if (temp_block_type === "bomb") {
			if (number_of_bombs > 9)
				temp_block_type = "empty";
			else
				number_of_bombs++;
		}

		//reference to the mine_field container
		var mine_field = $('.mine_field');
		//creating a new block element
		var new_block_div = $('<div>');

		//creating a new block object with default block_state and random block_type values
		var new_block_object = {block_state: "not_clicked",
								block_type: temp_block_type,
								block_coordinate_x: temp_coordinates['x'],
								block_coordinate_y: temp_coordinates['y'],
								block_adjacent_bombs: 0};

		if (temp_block_type === "bomb")
			block_bombs.push(new_block_object);

		//push new blocks object to array
		array_of_blocks.push(new_block_object);

		//set data-state, data-type, class & id attributes, and background image of the new block element
		new_block_div
			.data('state', new_block_object.block_state)
			.data('type', new_block_object.block_type)
			.attr('id', `${temp_coordinates['x']}` + "-" + `${temp_coordinates['y']}`)
			.addClass('block')
			.css('background-image', `url(assets/images/${new_block_object.block_state}.png)`);

		//and append the new block element to the mine_field container
		mine_field.append(new_block_div);

		//increment index_x
		index_x++;

		//unless index_x divided by 9 has a remainder of 0 (end of row)
		if (index_x % 9 === 0) {
			//then reset index_x and increment index_y (new row)
			index_x = 0;
			index_y++;
		}
	}
}

//needs to optimize too many loops
function countAdjacentMines() {
	for (var i = 0; i < array_of_blocks.length; i++){
		for (var j = 0; j < array_of_blocks.length; j++){
			if (!(array_of_blocks[i][j].block_type.bomb)){
				var count = 0;

				for (var p = i - 1; p <= i + 1; p++){
					for (var q = j - 1; q <= j + 1; q++){
						if (0 <= p && p < array_of_blocks.length && 0 <= q && q < array_of_blocks.length){
							if (array_of_blocks[p][q].block_type.bomb)
								++count;
						}
					}
				}

				array_of_blocks[i][j].block_adjacent_bombs(count);
			}
		}
	}
}

function startGameTimer () {
	interval = setTimeout(startGameTimer, 1000);
	seconds--;

	console.log("Time Remaining: " + fancyTimeFormat(seconds));

	if (seconds === 0) {    
		clearTimeout(interval);
		console.log("Game Over!");
	}   
}

function fancyTimeFormat(time) {   
	// Hours, minutes and seconds
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

//select clear method handles 'clear row' & 'clear column' power up data states
function select_clear(axis) {
	if (axis === 'row')
		if (!clear_row_used)
			clear_row_used = true, clear_row_selected = true;
	
	if (axis === 'column')
		if (!clear_column_used)
			clear_column_used = true, clear_column_selected = true;
}

//clear axis method handles UI state changes for 'clear row' & 'clear column' power ups
function clear_axis(index, comparison) {
	//for each element in the mine_field
	$('.mine_field').children('.block').each(function () {
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
			}
		});
	}
}

//power up that adds 30 seconds to the timer
function add_time() {
	seconds += 30;
}

function bomb_was_clicked() {
	
}

//when a div with the class 'block' is clicked on
$(document).ready(function() {
	$('body').on('mousedown', '.block', function(event) {
		switch (event.which) {
			case 1:
				if (clear_row_selected) {
					clear_axis(2, $(this).attr('id').charAt(2));
					clear_row_selected = false;
				} else if (clear_column_selected) {
					clear_axis(0, $(this).attr('id').charAt(0));
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
							.css('background-image', 'url(assets/images/bomb.png)');
						
						console.log("--- the bomb's coordinates were " + $(this).attr('id'));
					} else if ($(this).data('type') === "empty") {
						console.log("--- the clicked block's coordinates were " + $(this).attr('id'));
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
				}
				//if the clicked block's data-state attribute is already 'flagged'
				else if ($(this).data('state') === "flagged") {
					number_of_flagged_blocks--;

					//set its data-state attribute to 'not_clicked' and change the background image
					$(this)
						.data('state', 'not_clicked')
						.css('background-image', 'url(assets/images/not_clicked.png)');
				}

				break;
			default:
				//default case (also not used)
				console("how'd you manage to see this message? what kind of mouse is that?");

		}
	});
});