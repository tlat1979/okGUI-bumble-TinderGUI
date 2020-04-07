var validLocations = ['Tel Aviv', 'Ramat Aviv', 'Ramat Gan', 'Giv`atayim', 'Bat Yam', 'H̱olon', 'Ramat HaSharon', 'Yehud', 'Yafo', 'Herzliyya', 'Kfar Saba', 'Nes Ziyyona', 'Qiryat Ono', 'Ra`ananna', 'Ramat H̱en', 'Hod HaSharon', 'Gelilot', 'Ramat H̱ayyal', 'Rishon LeẔiyyon', 'Hadar Yosef', 'Ramat H̱en', 'Giv`at Shemu’el', 'Ezra Uviẕẕaron', 'Qiryat Shalom', 'Kefar Gannim', 'Gan H̱ayyim', 'Reẖovot', 'Petaẖ Tiqwa', 'Herzliyya'];
var validBody = ["average", "jacked", "overweight", "Full figured", "curvy", "A little extra"]
var [MIN_AGE, MAX_AGE] = [24, 47];
var getRandomInt = (min, max) => Math.floor(Math.random() * (max - min) + min);
var okBaseURL = 'https://www.okcupid.com';

var keyboardEvent = document.createEvent("KeyboardEvent");
var initMethod = typeof keyboardEvent.initKeyboardEvent !== 'undefined' ? "initKeyboardEvent" : "initKeyEvent";

keyboardEvent[initMethod](
    "input", // event type: keydown, keyup, keypress
    true,      // bubbles
    true,      // cancelable
    window,    // view: should be window
    false,     // ctrlKey
    false,     // altKey
    false,     // shiftKey
    false,     // metaKey
    83,        // keyCode: unsigned long - the virtual key code, else 0
    0          // charCode: unsigned long - the Unicode character associated with the depressed key, else 0
);


// General sleep function
var sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// This function assumes that it rund of the doubleTake page 
var getUserDetails = async (userId, win) => {
    var user = {};

    // User: name, age, location
    user.name = window.document.querySelectorAll(".cardsummary-reflux-realname")[0].textContent;
    user.age = window.document.querySelectorAll(".cardsummary-reflux-age")[0].textContent;
    user.location = window.document.querySelectorAll(".cardsummary-reflux-location")[0].textContent;
    user.matchPercentage = window.document.querySelectorAll(".cardsummary-reflux-match-pct")[0].textContent;

    // User Photos
    user.photos = [];
    var userPhotos = window.document.querySelectorAll(".qmcard-contents .image_wrapper > img");
    for (photo of userPhotos) {
        user.photos.push(photo.src);
    }

    // User basic info    
    user.details = [];
    var userDetails = win.document.querySelectorAll(".matchprofile-details-section");
    for (details of userDetails) {
        user.details.push(details.innerText);
    }

    // User extended info (essays)
    var profileEssays = win.document.querySelectorAll(".profile-essay");
    user.essays = [];
    for (essay of profileEssays) {
        user.essays.push(essay.innerText);
    }

    return user;
}

// Like / Pass from doubletake
var likeUserDoubleTake = () => window.document.querySelectorAll(".doubletake-like-button")[0].click();
var passUserDoubleTake = () => window.document.querySelectorAll(".doubletake-pass-button")[0].click();

// Like / Pass from User Profile
var likeUserFromProfile = () => window.document.querySelectorAll("#like-button")[0].click();
var passUserFromProfile = () => window.document.querySelectorAll("#pass-button")[0].click();

var sendMsg = async (msg, win) => {
    var newStr = "";

    // Inputing the msg letter by letter to simulate a real user
    [...msg].forEach(async c => {
        await sleep(100);
        newStr += c;
        win.document.querySelectorAll(".messenger-composer")[0].value = newStr;
        win.document.querySelectorAll(".messenger-composer")[0].dispatchEvent(keyboardEvent);
        console.log(newStr);
    });

    // Sending the message
    win.document.querySelectorAll(".messenger-toolbar-send")[0].click();
}

var isValidUser = user => {

    const validityFaults = [];
    let [aboutMe, herBasics, herBackground, herLookingFor, isValidLocation, isValidAge, isValidBody, hasKids, isBroken] = Array(9).fill('');
    try { aboutMe = user.essays[0] || ''; } catch (e) { }
    try { herBasics = user.details[0] || ''; } catch (e) { }
    try { herBackground = user.details[1] || ''; } catch (e) { }
    try { herLookingFor = user.details[2] || ''; } catch (e) { }

    validLocations = ['Tel Aviv', 'Ramat Aviv', 'Ramat Gan', 'Giv`atayim', 'Bat Yam', 'H̱olon', 'Ramat HaSharon', 'Yehud', 'Yafo', 'Herzliyya', 'Kfar Saba', 'Nes Ziyyona', 'Qiryat Ono', 'Ra`ananna', 'Ramat H̱en', 'Hod HaSharon', 'Gelilot', 'Ramat H̱ayyal', 'Rishon LeẔiyyon', 'Hadar Yosef', 'Ramat H̱en', 'Giv`at Shemu’el', 'Ezra Uviẕẕaron', 'Qiryat Shalom', 'Kefar Gannim', 'Gan H̱ayyim', 'Reẖovot', 'Petaẖ Tiqwa', 'Herzliyya'];

    isValidLocation = validLocations.some(location => location === user.location);
    isValidAge = user.age >= MAX_AGE && user.age < MIN_AGE;
    isValidBody = !validBody.some(body => body === user.details[0]);
    hasKids = herBackground.includes('Has kid(s)');
    isBroken = aboutMe.includes(' ילד ') || aboutMe.includes(' ילדה ') || aboutMe.includes('+') || aboutMe.includes(' פלוס ') || aboutMe.includes(' אמא ');

    let result = isValidLocation && isValidAge && isValidBody && !isBroken && !hasKids;
    let msg = ['%c' + user.name, okBaseURL + '/profile/' + user.id];

    result ?
        console.log(msg[0] + " Valid: " + msg[1], 'background: #222; color: #14e722') :
        console.log(msg[0] + " Broken: " + msg[1], 'background: #222; color: #a43c43');
    return result;
}

var main = async () => {

    // Assuming the DoubleTake page is open
    // Getting the current user ID
    let userProfileUrlString = window.document.querySelectorAll(".cardsummary-reflux-profile-link > a")[0].href;
    let userProfileUrlObj = new URL(userProfileUrlString);

    let pathName = userProfileUrlObj.pathname.split("/");
    user.userId = pathName[2];

    let win = window.open("https://www.okcupid.com/profile/" + userId + "?cf=quickmatch", "xxxx", "height=200,width=200");
    await sleep(10000);

    let user = await getUserDetails(user.userId, win);
    let isUserValid = isValidUser(user);
    // send message


    win.close();

    console.log(user);
}

main();
