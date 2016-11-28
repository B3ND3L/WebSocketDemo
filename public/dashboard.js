// a simple generator for random adjective-noun-composed names
var nameGenerator = (function() {
  var nouns = ['Cat', 'Dog', 'Duck', 'Bird', 'Panda', 'Chicken', 'Mouse', 'Fish', 'Lion', 'Tiger', 'Camel', 'Hedgehog'];
  var adjectives = ['Amusing', 'Athletic', 'Beautiful', 'Brave', 'Careless', 'Clever', 'Crafty', 'Creative', 'Cute', 'Dependable', 'Energetic', 'Famous', 'Friendly', 'Graceful', 'Helpful', 'Humble', 'Inconsiderate', 'Likable', 'Middle Class', 'Outgoing', 'Poor', 'Practical', 'Rich', 'Sad', 'Skinny', 'Successful', 'Thin', 'Ugly', 'Wealth'];

  return function() {
    return adjectives[Math.floor(Math.random() * adjectives.length)] + ' ' + nouns[Math.floor(Math.random() * nouns.length)];
  };
})();

// is a property defined ?
function def(prop) {
  return typeof prop !== 'undefined';
}

// store the name in a cookie.
var cookies = document.cookie.split(';');
var wsname = cookies.find(function(c) {
  if (c.match(/^wsname/) !== null) return true;
  return false;
});
if (def(wsname)) {
  wsname = wsname.split('=')[1];
} else {
  wsname = nameGenerator();
  document.cookie = "wsname=" + encodeURIComponent(wsname);
}
document.querySelector('header>p').textContent = decodeURIComponent(wsname);



// create a WebSocket to the server
var ws = new WebSocket("ws://" + window.location.host);//new WebSocket("ws://127.0.0.1:8080/WSServer_war_exploded/websocket/nope");

// we get notified once connected to the server
ws.onopen = function(event) {
  console.log("We are connected.");
};

// listen to messages comming from the server. When it happens, create a new <li> and append it to the DOM.
var messages = document.querySelector('#dashboard');
ws.onmessage = function(event) {

  let list = JSON.parse(event.data);
  list.sensors.forEach(s => {
    //ICI changer valeur IHM
    let elem = document.querySelector('#s'+s.id);
    //console.log(elem);
    if(elem === null){
      elem = document.createElement('div');
      elem.id = 's'+s.id;
      if(s.type === 'PERCENT' ){

        let prog = document.createElement('progress');
        prog.value = parseFloat(s.data)*100;
        prog.max = '100';
        prog.id = '#s'+s.id+'_progress';
        let text = document.createTextNode(s.data+"%");
        prog.appendChild(text);
        elem.appendChild(prog);

      } else if (s.type === 'ON_OFF'){


      } else {

      }
    } else {
    //  console.log('update');
      if(s.type === 'PERCENT' ){
        console.log('#s1248_progress ?=' + '#s'+s.id+'_progress' );
        let prog = document.querySelector('#s'+s.id+'_progress');
        prog.value = parseFloat(s.data)*100;
        console.log(s.data);
      } else if (s.type === 'ON_OFF'){

      }
    }
    messages.appendChild(elem);
   });
/*
  line = document.createElement('li');
  line.textContent = ;
  messages.appendChild(line);
  */
};
