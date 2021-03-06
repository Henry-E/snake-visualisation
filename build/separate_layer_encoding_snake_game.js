$(document).ready(function(){ 

   //Canvas stuff
    var canvas = $("#canvas")[0];
    var ctx = canvas.getContext("2d");
    var w = $("#canvas").width();
    var h = $("#canvas").height();
    
    //Lets save the cell width in a variable for easy control
    var cw = 10;
    var d;
    var food;
    var score;
    var test_array;

    var current_step_array;
    // var last_step_array;

    // game counts left, counts top




    //Lets create the snake now
    var snake_array; //an array of cells to make up the snake
    var snake_agent;

    // Setting up a Deep q learning agent and its functions
  var Agent = function() {
      
        // positional information
        // this will have to be the input array

        // We can replace these actions with the up, down, left, right stuff
        this.actions = [];
        this.actions.push("left");
        this.actions.push("up");
        this.actions.push("right");
        this.actions.push("down");
        
        // braaain
        //this.brain = new deepqlearn.Brain(this.eyes.length * 3, this.actions.length);
        var spec = document.getElementById('qspec').value;
        eval(spec);
        this.brain = brain;
      }
      Agent.prototype = {
      forward: function(input_array) {
        // in forward pass the agent simply behaves in the environment
        // create input to brain
        // var input_array = 0; //this will be nick's array function
        // console.log(input_array);
        // get action from brain
        var actionix = this.brain.forward(input_array);
        var action = this.actions[actionix];

        if(action == "left" && d != "right") d = "left";
        else if(action == "up" && d != "down") d = "up";
        else if(action == "right" && d != "left") d = "right";
        else if(action == "down" && d != "up") d = "down";


        // console.log(actionix, action);
        // this.actionix = actionix; //back this up
      },
       backward: function() {
          var reward = 0.0;

          var snake_head = snake_array[0]
          
          // unmaking the original mistake
          // If the head is at the location of the food
          // give a reward
          // for some reason beforehand, I was giving
          // the reward if the snake was moving onto the head
          // which lead to it learning patterns where it looked
          // like it was almost avoiding eating the food
          for(var i = 0; i < food.length; i++)
          {
            if(snake_head.x == food[i].x && snake_head.y == food[i].y)
              reward = 1;
          }            
            // console.log(reward);
            // pass to brain for learning
            this.brain.backward(reward);
          }
     }

     // creating a start function that only gets called once so that the interval doesn't keep getting
     // reset and that the agent doesn't keep getting reset also
     function start()
     {
        snake_agent = new Agent;

        if(typeof game_loop != "undefined") clearInterval(game_loop);
        game_loop = setInterval(paint, 0);
     }
     start();

    function init()
    {

      // current_step_array = zeros([w/cw, h/cw]);
    // last_step_array = zeros([w/cw, h/cw]);

        // test_array = Array.apply(null, Array((h/cw)*(w/cw))).map(Number.prototype.valueOf,0);

        // console.log(test_array.length)
        // console.log(test_array[0])

        d = "right"; //default direction
        create_snake();
        food = []
        // Have to initialise food for the first time we use the collision function
        create_food(); //Now we can see the food particle
        //finally lets display the score
        score = 0;

        // get_input_array();
        // current_step_array = test_array;
        
        //Lets move the snake now using a timer which will trigger the paint function
        //every 60ms
        // if(typeof game_loop != "undefined") clearInterval(game_loop);
        // game_loop = setInterval(paint, 60);
    }
    init();
    
    function create_snake()
    {
        var length = 2; //Length of the snake
        var x_offset = Math.floor((w / cw) / 2);
        var y_offset = Math.floor((h / cw) / 2);
        // console.log(x_offset, y_offset);
        snake_array = []; //Empty array to start with
        for(var i = x_offset+length-1; i>=x_offset; i--)
        {
            //This will create a horizontal snake starting from the top left
            snake_array.push({x: i, y:y_offset});
            // test_array[i,0] = 2;
        }
    }
    
    //Lets create the food now
    function create_food()
    {
        var isCollision = true;
        
        // might need to add a check so that once the snake is over a certain
        // length we simply end the game
        while(isCollision)
        {
            // generate coordinates
            var x_food = Math.round(Math.random()*(w-cw)/cw);
            var y_food = Math.round(Math.random()*(h-cw)/cw);

            // check them
            isCollision = check_food_snake_collision(x_food, y_food, snake_array);

            // if(x_food == food.x || y_food == food.y)
            // {
            //     isCollision = true;
            // }
            // console.log(x_food, y_food, snake_array);
            // if(isCollision) console.log("food generated on top of snake by accident");
        }
        // assign food to the new location

        food = [{
            x: x_food, 
            y: y_food, 
        }];

        // console.log(food['y']);
        // test_array[food['x'], food['y']] = 1;

        // console.log(test_array[0]);
        // console.table(JSON.stringify(test_array));
        // console.table(test_array);

        // console.log(food['x'])
        // console.log(food['y'])

        //This will create a cell with x/y between 0-44
        //Because there are 45(450/10) positions accross the rows and columns
    }
    
    //Lets paint the snake now
    function paint()
    {
        snake_agent.brain.visSelf(document.getElementById('brain_info_div'));
        //To avoid the snake trail we need to paint the BG on every frame
        //Lets paint the canvas now
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = "black";
        ctx.strokeRect(0, 0, w, h);

        //Lets paint the food
        for(var i = 0; i < food.length; i++)
        {
            paint_cell(food[i].x, food[i].y, "red");
        }


        for(var i = 0; i < snake_array.length; i++)
        {
            var c = snake_array[i];
            //Lets paint 10px wide cells
            cell_colour = 'rgb(' + ((i / (snake_array.length - 1)) * 200) + ',' + ((i / (snake_array.length - 1)) * 200) + ', 255)';
            paint_cell(c.x, c.y, cell_colour);
            // test_array[c.y][c.x] = 2;
        }
        


        // Calculate all the stuff need for the forward pass 
        var input_array = [];
        // just the tip
        var snake_head = [snake_array[0]];
        var current_step_array_snake = get_input_array(snake_head);
        var current_step_array_food = get_input_array(food);

        // We're only inputing the current time step
        for(var i = 0; i < current_step_array_snake.length; i++)
        {
            input_array = input_array.concat(current_step_array_snake[i]);
        }

        for(var i = 0; i < current_step_array_food.length; i++)
        {
            input_array = input_array.concat(current_step_array_food[i]);
        }

        // This call the function that sets an update for d
        snake_agent.forward(input_array);// ***********************************

        // Run the backward pass 
        snake_agent.backward();

        // d = snake_agent.forward();

        // console.log(input_array);
        // console.table(current_step_array);




        
        //The movement code for the snake to come here.
        //The logic is simple
        //Pop out the tail cell and place it infront of the head cell
        var nx = snake_array[0].x;
        var ny = snake_array[0].y;


        // snake eats food, create new food
        // but only if there's a single food, rather than a shape
        if(food.length == 1 && nx == food[0].x && ny == food[0].y)
        {
            create_food();
        }


        //These were the position of the head cell.
        //We will increment it to get the new head position
        //Lets add proper direction based movement now
        // The snake kept hitting into the wall and avoiding that
        // so we're making it infinite now
        // (x - 1 == -1 ? n-1: x - 1);
        // (x + 1 == n ? 0: x + 1);
        if(d == "right") nx = (nx + 1 == w/cw ? 0: nx + 1);
        else if(d == "left") nx = (nx - 1 == -1 ? w/cw-1: nx - 1);
        else if(d == "up") ny = (ny - 1 == -1 ? h/cw-1: ny - 1);
        else if(d == "down") ny = (ny + 1 == h/cw ? 0: ny + 1);
        

        


        //The snake can now eat the food.
        var tail = snake_array.pop(); //pops out the last cell
        tail.x = nx; tail.y = ny;
        snake_array.unshift(tail); //puts back the tail as the first cell
        
        // test_array = zeros([w/cw, h/cw]);


        // After all the painting and updates, calculate the input array stuff
        // last_step_array = current_step_array;
        // For some stupid reason we have to call this function and it updates the test array global variable
        // We're chec
        // get_input_array();
        // current_step_array = test_array;
        // console.table(test_array);


        // test_array[food.y][food.x] = 1;
        //Lets paint the score
        var score_text = score;
        ctx.fillText(score_text, 5, h-5);

        // console.log(test_array);
        // print_array(test_array);
        // console.table(test_array);
    }

    function zeros(dimensions) {
        var array = [];

        for (var i = 0; i < dimensions[0]; ++i) {
            array.push(dimensions.length == 1 ? 0 : zeros(dimensions.slice(1)));
        }

        return array;
    }
    
    function get_input_array(board_item) {
        var test_array = zeros([w/cw, h/cw]);

        for(var i = 0; i < board_item.length; i++)
        {
            // We reverse x and y here so that x corresponds
            // with rows and y with columns
            test_array[board_item[i].y][board_item[i].x] = 1;
        }

        return test_array;       
    }
    
    //Lets first create a generic function to paint cells
    function paint_cell(x, y, colour)
    {
        ctx.fillStyle = colour;
        ctx.fillRect(x*cw, y*cw, cw, cw);
        ctx.strokeStyle = "white";
        ctx.strokeRect(x*cw, y*cw, cw, cw);
    }
    
    function check_collision(x, y, array)
    {
        var nx = snake_array[0].x;
        var ny = snake_array[0].y;

        // We add in an extra check for whether or not food has been eaten
        // so we appropriately ignore the last element of the snake's tail

        // this one only applies if x, y are snake head coordinates
        if(nx == food.x && ny == food.y)
        {
            // Do nothing, the tail is extending and can
            // hit into itself
            for(var i = 0; i < array.length; i++)
            {
                if(array[i].x == x && array[i].y == y)
                 return true;
            }
        }
        else
        {
            // ignore the last element of the array;
            for(var i = 0; i < array.length - 1; i++)
            {
                if(array[i].x == x && array[i].y == y)
                 return true;
            }
        }


        //This function will check if the provided x/y coordinates exist
        //in an array of cells or not

        return false;
    }
    
    //Lets add the keyboard controls now
    $(document).keydown(function(e){
        var key = e.which;
        //We will add another clause to prevent reverse gear
        if(key == "37" && d != "right") d = "left";
        else if(key == "38" && d != "down") d = "up";
        else if(key == "39" && d != "left") d = "right";
        else if(key == "40" && d != "up") d = "down";
        //The snake is now keyboard controllable
    })
    
    function print_array(array) {
        for (var i = 0; i < array.length; i++) {
            console.log(array[i]);
        }
    }


    // window.goslow = function(){
    //   console.log("Henry")
    // }

    window.goveryfast = function(){
      window.clearInterval(game_loop);
      game_loop = setInterval(paint, 0);
      console.log("going very fast")
    }


    window.gofast = function(){
      clearInterval(game_loop);
      game_loop = setInterval(paint, 20);
      // skipdraw = false;
      // simspeed = 2;
    }

    window.gonormal = function(){
      clearInterval(game_loop);
      game_loop = setInterval(paint, 60);
    }



    window.goslow = function(){
      clearInterval(game_loop);
      game_loop = setInterval(paint, 300);
      // skipdraw = false;
      // simspeed = 0;
    }
    
    window.savenet = function() {
      var j = snake_agent.brain.value_net.toJSON();
      var t = JSON.stringify(j);
      document.getElementById('tt').value = t;
    }
    
     window.loadnet = function() {
      var t = document.getElementById('tt').value;
      var j = JSON.parse(t);
      snake_agent.brain.value_net.fromJSON(j);
      stoplearn(); // also stop learning
      // gonormal();
    }
    
    window.startlearn = function(){
      snake_agent.brain.learning = true;
      goveryfast();
    }
    window.stoplearn = function(){
      snake_agent.brain.learning = false;
      gonormal();
    }
    
    window.print_current_array = function(){
        // console.log(game_loop);
    }
  
  
  
    function check_snake_snake_collision(x, y, array)
    {
       // We're taking the new location of the snake head, checking it against
       // food coordinates and deciding whether to check collision of whole snake
       // body or if we should ignore the tail since no food has been consumed

        // this one only applies if x, y are snake head coordinates
        if(x == food.x && y == food.y)
        {
            // Do nothing, the tail is extending and can
            // hit into itself
            for(var i = 0; i < array.length; i++)
            {
                if(array[i].x == x && array[i].y == y)
                 return true;
            }
        }
        else
        {
            // ignore the last element of the array;
            for(var i = 0; i < array.length - 1; i++)
            {
                if(array[i].x == x && array[i].y == y)
                 return true;
            }
        }


        //This function will check if the provided x/y coordinates exist
        //in an array of cells or not

        return false;
    }

    function check_food_snake_collision(x, y, array)
    {
       // To make sure no food is generated on top of the snake or at the exisiting food location

        // Definitely don't generate food at the existing food coordinates
        if(x == food.x && y == food.y)
            return true;

        // Check the whole snake array otherwise
        for(var i = 0; i < array.length; i++)
        {
            if(array[i].x == x && array[i].y == y)
             return true;
        }

        //This function will check if the provided x/y coordinates exist
        //in an array of cells or not

        return false;
    }
  
  
})
