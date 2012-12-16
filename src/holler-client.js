// 
// name         : holler-client.js
// description  : Connects to a Faye server & subscribes to notifications
// 

(function (args) {

  // grab host & port off config obj
  var h     = window.hollerConfig,
      port  = h && h.port ? h.port : "1337",
      host  = h && h.host ? h.host : "http://127.0.0.1";

  // load alertify css
  // TODO : a better way to do this, this is brittle & ugly
  var style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = ".alertify-show, .alertify-log { -webkit-transition: all 500ms cubic-bezier(0.175, 0.885, 0.320, 1); /* older webkit */ -webkit-transition: all 500ms cubic-bezier(0.175, 0.885, 0.320, 1.275); -moz-transition: all 500ms cubic-bezier(0.175, 0.885, 0.320, 1.275); -ms-transition: all 500ms cubic-bezier(0.175, 0.885, 0.320, 1.275); -o-transition: all 500ms cubic-bezier(0.175, 0.885, 0.320, 1.275); transition: all 500ms cubic-bezier(0.175, 0.885, 0.320, 1.275); /* easeOutBack */ } .alertify-hide { -webkit-transition: all 250ms cubic-bezier(0.600, 0, 0.735, 0.045); /* older webkit */ -webkit-transition: all 250ms cubic-bezier(0.600, -0.280, 0.735, 0.045); -moz-transition: all 250ms cubic-bezier(0.600, -0.280, 0.735, 0.045); -ms-transition: all 250ms cubic-bezier(0.600, -0.280, 0.735, 0.045); -o-transition: all 250ms cubic-bezier(0.600, -0.280, 0.735, 0.045); transition: all 250ms cubic-bezier(0.600, -0.280, 0.735, 0.045); /* easeInBack */ } .alertify-cover { position: fixed; z-index: 99999; top: 0; right: 0; bottom: 0; left: 0; } .alertify { position: fixed; z-index: 99999; top: 50px; left: 50%; width: 550px; margin-left: -275px; } .alertify-hidden { top: -50px; visibility: hidden; } .alertify-logs { position: fixed; z-index: 5000; bottom: 10px; right: 10px; width: 300px; } .alertify-log { display: block; margin-top: 10px; position: relative; right: -300px; } .alertify-log-show { right: 0; } .alertify-dialog { padding: 25px; } .alertify-resetFocus { border: 0; clip: rect(0 0 0 0); height: 1px; margin: -1px; overflow: hidden; padding: 0; position: absolute; width: 1px; } .alertify-inner { text-align: center; } .alertify-text { margin-bottom: 15px; width: 100%; -webkit-box-sizing: border-box; -moz-box-sizing: border-box; box-sizing: border-box; font-size: 100%; } .alertify-buttons { } .alertify-button { /* line-height and font-size for input button */ line-height: 1.5; font-size: 100%; display: inline-block; cursor: pointer; margin-left: 5px; } @media only screen and (max-width: 680px) { .alertify, .alertify-logs { width: 90%; -webkit-box-sizing: border-box; -moz-box-sizing: border-box; box-sizing: border-box; } .alertify { left: 5%; margin: 0; } } /** * Default Look and Feel */ .alertify, .alertify-log { font-family: sans-serif; } .alertify { background: #FFF; border: 10px solid #333; /* browsers that don't support rgba */ border: 10px solid rgba(0,0,0,.7); border-radius: 8px; box-shadow: 0 3px 3px rgba(0,0,0,.3); -webkit-background-clip: padding; /* Safari 4? Chrome 6? */ -moz-background-clip: padding; /* Firefox 3.6 */ background-clip: padding-box; /* Firefox 4, Safari 5, Opera 10, IE 9 */ } .alertify-text { border: 1px solid #CCC; padding: 10px; border-radius: 4px; } .alertify-button { border-radius: 4px; color: #FFF; font-weight: bold; padding: 6px 15px; text-decoration: none; text-shadow: 1px 1px 0 rgba(0,0,0,.5); box-shadow: inset 0 1px 0 0 rgba(255,255,255,.5); background-image: -webkit-linear-gradient(top, rgba(255,255,255,.3), rgba(255,255,255,0)); background-image: -moz-linear-gradient(top, rgba(255,255,255,.3), rgba(255,255,255,0)); background-image: -ms-linear-gradient(top, rgba(255,255,255,.3), rgba(255,255,255,0)); background-image: -o-linear-gradient(top, rgba(255,255,255,.3), rgba(255,255,255,0)); background-image: linear-gradient(top, rgba(255,255,255,.3), rgba(255,255,255,0)); } .alertify-button:hover, .alertify-button:focus { outline: none; box-shadow: 0 0 15px #2B72D5; background-image: -webkit-linear-gradient(top, rgba(0,0,0,.1), rgba(0,0,0,0)); background-image: -moz-linear-gradient(top, rgba(0,0,0,.1), rgba(0,0,0,0)); background-image: -ms-linear-gradient(top, rgba(0,0,0,.1), rgba(0,0,0,0)); background-image: -o-linear-gradient(top, rgba(0,0,0,.1), rgba(0,0,0,0)); background-image: linear-gradient(top, rgba(0,0,0,.1), rgba(0,0,0,0)); } .alertify-button:active { position: relative; top: 1px; } .alertify-button-cancel { background-color: #FE1A00; border: 1px solid #D83526; } .alertify-button-ok { background-color: #5CB811; border: 1px solid #3B7808; } .alertify-log { background: #1F1F1F; background: rgba(0,0,0,.9); padding: 15px; border-radius: 4px; color: #FFF; text-shadow: -1px -1px 0 rgba(0,0,0,.5); } .alertify-log-error { background: #FE1A00; background: rgba(254,26,0,.9); } .alertify-log-success { background: #5CB811; background: rgba(92,184,17,.9); }";
  document.getElementsByTagName('head')[0].appendChild(style);

  // quick n dirt dynamic js loader
  var loadScript = function(src, callback) {
    var head = document.getElementsByTagName('head')[0];
    if(head){
      var script = document.createElement('script');  
      script.setAttribute('src',src);
      script.setAttribute('type','text/javascript');
      var loadFunction = function(){
        if (this.readyState == 'complete' || this.readyState == 'loaded'){
          callback(); 
        }
      };
      script.onreadystatechange = loadFunction;
      script.onload = callback;
      head.appendChild(script);
    }
  };

  // load faye js deps
  loadScript(host+":"+port+"/faye/client.js", function(){
    // when done, connect to client
    var client = new Faye.Client(host+":"+port+'/faye',{
      timeout: 120,
      retry: 5
    });
    // subscribe to notification channel
    var subscription = client.subscribe('/holler',function(obj) {
      alertify.log(obj.message, obj.type);
    });
  });

}(this));