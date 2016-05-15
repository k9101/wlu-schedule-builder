var steps = [];
var testindex = 0;
var loadInProgress = false; //This is set to true when a page is still loading
var courses = [];
/*********SETTINGS*********************/
var webPage = require('webpage');
var page = webPage.create();
page.settings.userAgent = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36';
page.settings.javascriptEnabled = true;
page.settings.loadImages = false; //Script is much faster with this field set to false
phantom.cookiesEnabled = true;
phantom.javascriptEnabled = true;
/*********SETTINGS END*****************/

console.log('All settings loaded, start with execution');
page.onConsoleMessage = function(msg) {
    console.log(msg);
};
/**********DEFINE STEPS THAT PHANTOM SHOULD DO***********************/
steps = [

    //Step 1 - Open LORIS home page
    function() {
        console.log('Step 1 - Open LORIS login page');
        page.open("https://loris.wlu.ca/ssb_prod/twbkwbis.P_ValLogin", function(status) {

        });
    },
    //Step 2 - Populate and submit the login form
    function() {
        console.log('Step 2 - Populate and submit the login form');
        page.evaluate(function() {
            document.getElementById("UserID").value = "#########"
            document.getElementsByName('PIN')[0].value = "########";
            document.getElementsByName('loginform')[0].submit();
        });
    },
    //Step 3 - Wait LORIS to login user. After user is successfully logged in, user is redirected to home page.
    //Navigate to the Search for student detail services
    function() {
        console.log("Step 3 - Wait LORIS to login user. After user is successfully logged in, user is redirected to home page.");
        var title = page.evaluate(function() {
          return document.title;
        });

        if(title == "Main Menu") {
          console.log("Log in Successful!");
        }

        page.evaluate(function(){
          document.getElementsByName('KEYWRD_IN')[0].value = 'Student Detail Schedule';
          document.getElementsByTagName('form')[0].submit();
        });
    },
    //Step 4 - On the Search page, navigate to Student Detail Schedule
    function(){
      console.log("Step 4 - On the Search page, navigate to Student Detail Schedule");
      page.evaluate(function(){
        document.getElementsByClassName('submenulinktext2')[3].click();
      });
    },
    //Step 5 - Select the required term
    function(){
      console.log('Step 5 - Select the required term');
      var title = page.evaluate(function() {
        return document.title;
      });
      if(title == 'Registration Term'){
        page.evaluate(function(){
          document.getElementById('term_id').value = '201605';
          document.getElementsByTagName('form')[1].submit();
        });
      }else{
        console.log("Something went wrong, on page: " + title);
      }
    },
    function(){
      console.log('Step 6 - Read the Schedule and extract data');
      courses = page.evaluate(function(){
        var scheduleDiv = document.querySelectorAll('.datadisplaytable');
        var courseList = [];
        for(var i = 0; i < scheduleDiv.length; i += 2){
          //read the first table and get caption
          var course = {};
          var caption = scheduleDiv[i].querySelector('.captionText').innerText.split(' - '); // of the form: NAME - COUSE ID - SECTION
          course.name = caption[0];
          course.id = caption[1];
          course.section = caption[2];

          //Read the lower table to get date, time, location, date range, and prof
          var lowerTableElements = document.querySelectorAll('.pagebodydiv .datadisplaytable')[1].querySelectorAll('tr')[1].children;
          course.time = lowerTableElements[1].innerText;
          course.days = lowerTableElements[2].innerText;
          course.where = lowerTableElements[3].innerText;
          course.range = lowerTableElements[4].innerText;
          course.instructor = lowerTableElements[4].innerText;
          courseList.push(course);
        }
        return courseList;
      });



    }
];
/**********END STEPS THAT PHANTOM SHOULD DO***********************/

//Execute steps one by one
interval = setInterval(executeRequestsStepByStep, 50);

function executeRequestsStepByStep() {
    if (loadInProgress == false && typeof steps[testindex] == "function") {
        //console.log("step " + (testindex + 1));
        steps[testindex]();
        testindex++;
    }
    if (typeof steps[testindex] != "function") {
        console.log("test complete!");
        courses.forEach(function(item, index){
          console.log(item.name);
        });
        phantom.exit();
    }
}

/**
 * These listeners are very important in order to phantom work properly. Using these listeners, we control loadInProgress marker which controls, weather a page is fully loaded.
 * Without this, we will get content of the page, even a page is not fully loaded.
 */
page.onLoadStarted = function() {
    loadInProgress = true;
    console.log('Loading started');
};
page.onLoadFinished = function() {
    loadInProgress = false;
    console.log('Loading finished');
};
page.onConsoleMessage = function(msg) {
    console.log(msg);
};
