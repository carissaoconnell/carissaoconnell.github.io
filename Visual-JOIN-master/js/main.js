var joinApp = angular.module('joinApp', ['ngSanitize']);



function JoinsCtrl($scope) {


  $scope.users = [
    { id: 1, name: 'Isabella' },
    { id: 2, name: 'Robert' },
    { id: 3, name: 'Maria' },
    { id: 4, name: 'Thomas' },
    { id: 5, name: 'Elizabeth' }
  ];

  $scope.enjoys = [
    { user_id: 3, interest: 'Swimming' },
    { user_id: 1, interest: 'Diving' },
    { user_id: 1, interest: 'Hiking' },
    { user_id: 6, interest: 'Playing piano' },
    { user_id: 4, interest: 'Yoga' }
  ];

  $scope.sql = {
    show_desc: false,
    toggle_desc: function(){
      $scope.sql.show_desc = $scope.sql.show_desc ? false : true;
    },
    inner: {
      query: "SELECT users.name, enjoys.interest FROM users JOIN enjoys ON users.id = enjoys.user_id;",
      desc: "INNER JOIN or just JOIN retrieves all the data from the users and enjoys field that match each other (where the id field in users matches a user_id in the interest table and vice versa)"
    },
    left: {
      query: "SELECT users.name, enjoys.interest FROM users LEFT JOIN enjoys ON users.id = enjoys.user_id;",
      desc: "LEFT JOIN retrieves all the data from the users and enjoys field or NULL if the enjoys field doesn't have data for the user"
    },
    right: {
      query: "SELECT users.name, enjoys.interest FROM users RIGHT JOIN enjoys ON users.id = enjoys.user_id;",
      desc: "RIGHT JOIN retrieves all the data from the interest field and retrieves the matching data in the users field or NULL if it doesn't have data in the user field"
    },
    outer: {
      query: "SELECT users.name, enjoys.interest FROM users LEFT OUTER JOIN enjoys ON users.id = enjoys.user_id"+
             "<br>UNION"+
             "<br>SELECT users.name, enjoys.interest FROM users RIGHT OUTER JOIN enjoys ON users.id = enjoys.user_id",
      desc: "OUTER JOIN or OUTER LEFT and RIGHT with UNION (MySQL doesn't support FULL OUTER JOIN) retrieves all data from the users and enjoys fields and matches them and sets NULL on any interest without a match on user and same thing with user with no matching interest"
    }
  };

  $scope.joins = [];
  $scope.user_ids = [];
  $scope.current_join = 'inner';
  $scope.type = false;

  $scope.isNotSelected = function(id){
    if($scope.user_ids.indexOf(id) === -1){
      return 'is-not-selected';
    }
  }

  $scope.currentJoinClass = function(join){
    if($scope.current_join == join){
      return 'current-join';
    }
  }


  $scope.selectJoin = function(join){
    $scope.current_join = join;
    $scope[join +'Join']();
  };

  $scope.removeItem = function(type, index){
    $scope[type].splice(index, 1);
    $scope.selectJoin($scope.current_join);
  };


  $scope.addModal = function(type){
    $scope.type = type;
    var id = 1;

    $scope.modalType = 'add';

    // auto-increment user id as default on add and show lates
    $scope.users.forEach(function(user){
      if(id < user.id) id = user.id;
    });
    if(type == 'users'){
      id++;
    }
    $scope.addId = id;

    // Focus on the id field
    setTimeout(function(){
      var add = document.getElementById('addId');
      add.focus();
    }, 100)

  }

  $scope.addItem = function(){

    // add the item to the array
    if($scope.type == 'users'){
      $scope[$scope.type].push({ id: $scope.addId, name: $scope.addName });
    }else{
      $scope[$scope.type].push({ user_id: $scope.addId, interest: $scope.addName });
    }

    // Clear the data
    $scope.addName = '';
    $scope.addId = '';

    // recreate the join table
    $scope.selectJoin($scope.current_join);

    // Close the modal
    $scope.modalType = false;
  };


  // SELECT users.name, enjoys.interest FROM users JOIN enjoys ON users.id = enjoys.user_id;
  $scope.innerJoin = function(){

    var result = [];
    $scope.user_ids = [];

    // Loop through all enjoys and users to find matches
    angular.forEach($scope.enjoys, function(interest){ // value, key
      angular.forEach($scope.users, function(user){
        if(user.id == interest.user_id){
          result.push({ name: user.name, interest: interest.interest });
          $scope.user_ids.push(user.id);
        }
      });
    });
    $scope.joins = result;
  };

  // Default
  $scope.innerJoin();


  // SELECT users.name, enjoys.interest FROM users LEFT JOIN enjoys ON users.id = enjoys.user_id;
  $scope.leftJoin = function(){

    var result = [];
    $scope.user_ids = [];

    // Loop through all enjoys and users to find matches
    angular.forEach($scope.users, function(user){ // value, key
      var hasInterest = false;
      $scope.user_ids.push(user.id);
      angular.forEach($scope.enjoys, function(interest){
        if(user.id == interest.user_id){
          result.push({ name: user.name, interest: interest.interest });
          hasInterest = true;
        }
      });
      if(!hasInterest){
        result.push({ name: user.name, interest: 'NULL' });
      }
    });
    $scope.joins = result;
  };


  // SELECT users.name, enjoys.interest FROM users RIGHT JOIN enjoys ON users.id = enjoys.user_id;
  $scope.rightJoin = function(){

    var result = [];
    $scope.user_ids = [];

    // Loop through all enjoys and users to find matches
    angular.forEach($scope.enjoys, function(interest){ // value, key
      var hasInterest = false;
      $scope.user_ids.push(interest.user_id);
      angular.forEach($scope.users, function(user){
        if(user.id == interest.user_id){
          result.push({ name: user.name, interest: interest.interest });
          hasInterest = true;
        }
      });
      if(!hasInterest){
        result.push({ name: 'NULL', interest: interest.interest });
      }
    });
    $scope.joins = result;
  };


  // SELECT users.name, enjoys.interest FROM users LEFT OUTER JOIN enjoys ON users.id = enjoys.user_id
  // UNION
  // SELECT users.name, enjoys.interest FROM users RIGHT OUTER JOIN enjoys ON users.id = enjoys.user_id
  $scope.outerJoin = function(){

    var result = [];
    $scope.user_ids = [];

    // Loop through all enjoys and users to find matches
    angular.forEach($scope.users, function(user){ // value, key
      var hasInterest = false;
      $scope.user_ids.push(user.id);
      angular.forEach($scope.enjoys, function(interest){
        if(user.id == interest.user_id){
          result.push({ name: user.name, interest: interest.interest });
          hasInterest = true;
        }
      });
      if(!hasInterest){
        result.push({ name: user.name, interest: 'NULL' });
      }
    });

    // Loop through all enjoys and users to find matches
    angular.forEach($scope.enjoys, function(interest){ // value, key
      if($scope.user_ids.indexOf(interest.user_id) === -1){
        result.push({ name: 'NULL', interest: interest.interest });
        $scope.user_ids.push(interest.user_id);
      }
    });

    $scope.joins = result;
  };

}





// Heigh and width = canvas
var height = 150,                         // Canvas height
    width = height + height / 2,          // Canvas width
    ratio = (window.innerWidth < 410 ) ? .25 : .5, // The <svg> size in ratio (If is mobile)
    strokeWidth = 3,                      // Circle stroke width
    s_width = width*ratio,                // <svg> width
    s_height = (height / width * s_width),// <svg> height

    center = height / 2,                  // first circle center left and both center top
    center2 = height,                     // Second circle
    radius = center - strokeWidth,        // The circles radius
    fillColor = "#CC333F";                // The fill color

// Set attributes on the svg tag
var svgAttr = {
  viewBox: "0 0 "+ width +" "+ height,
  preserveAspectRatio: "xMaxYmax",
  width: s_width,
  height: s_height
};

// Default attributes for the circles
var defaultAttr = {
  fill: "none",
  stroke: "#EB6841",
  strokeWidth: strokeWidth
};

// Create an object for the svg's with custom settings
var svgs = {
  // Inner Join
  inner: {},
  // Left Join
  left: {
    attr: {
      c1: {
        fill: fillColor
      },
      c2: {
        fill: "transparent"
      }
    }//
  },
  // Right Join
  right: {
    reverse: true,
    attr: {
      c1: {
        fill: "transparent"
      },
      c2: {
        fill: fillColor
      }
    }//
  },
  // Outer Join
  outer: {
    attr: {
      c1: {
        fill: fillColor
      },
      c2: {
        fill: fillColor
      }
    }
  }
};

// Loop through all svg's and create the circles
for(var svg in svgs){

  // Attach the current object to a variable
  var current = svgs[svg];
  current.main = Snap("#"+ svg).attr(svgAttr);

  // Create an array of the 2 circles and if isset revers the order
  var circles = ['c1', 'c2'];
  if(current.reverse) circles.reverse()

  // Loop through the 2 circles
  circles.forEach(function(key){

    // depending on which circle make left center different
    var center1 = (key == 'c1') ? center : center2;
    var table = (key == 'c1') ? 'users' : 'enjoys';

    // Create the circle with default attr and the table it represent
    current[key] = current.main.circle(center1, center, radius)
                    .attr(defaultAttr)
                    .data('table', table);

    if(key == 'c1'){
      current[key].attr({
        stroke: "#00A0B0"
      })
    }
  });

  // Set custom attributes on the circles
  if(typeof current.attr != 'indefined'){
    for(var circle in current.attr){
      current[circle].attr(current.attr[circle]);
    }
  }
};


// inner
var inner = svgs.inner.main;
// Generate a new circle and one mask part of it
var cc1_inner = inner.circle(center,center,radius);
cc1_inner.attr({
    fill: fillColor
});
var cc2_inner = inner.circle(center2,center,radius);
cc2_inner.attr({
  fill: "#fff"
});
cc1_inner.attr({
  mask: cc2_inner
});


// Outer
var outer = svgs.outer.main;
// Create another circle to generate the crossing strokes
var cc1 = outer.circle(center,center,radius);
cc1.attr({
    fill: "none",
    stroke: "#00A0B0",
    strokeWidth: strokeWidth
});
