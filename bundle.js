var XMLHttpRequestPromise = require('xhr-promise');
 
var xhrPromise = new XMLHttpRequestPromise();
var button = document.querySelector('#declare');
button.addEventListener('click', handleClick);

window.b = button;

function handleClick () {
  var opts = {
    method: 'GET',
    url: '/bankrupt'
  };
  updateUi();  
  xhrPromise.send(opts).then(success).catch(error);

}

function updateUi(finished, err) {
  var headline = document.querySelector('h1');
  
  if (finished) {
    headline.textContent = 'Mazel tov, you have 0 unread items!';
    button.innerHtml = '&#x1f4a9;';
    button.style.setProperty('cursor', 'not-allowed');
  }
  else if (err) {
    headline.textContent = 'Well, we messed up. Can you refresh and try again?';
  }
  else {
    button.textContent = 'Let\'s give this a go...';
    button.disabled = true;
    button.style.setProperty('cursor', 'wait'); 
  }
}
     
function success (results) {
  console.log('yay!', results);
  updateUi(true);
  return results;
}

function error (err) {
  console.log('boo :(', err);
  updateUi(null,true);
  return err;
}
