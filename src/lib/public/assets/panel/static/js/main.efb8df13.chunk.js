(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{170:function(e,t,a){e.exports=a.p+"static/media/zation-logo.d46e3e57.svg"},173:function(e,t,a){e.exports=a.p+"static/media/zationLogo.fe76f2a9.svg"},5396:function(e,t,a){e.exports=a(5596)},5409:function(e,t,a){},5411:function(e,t,a){},5413:function(e,t,a){},5485:function(e,t,a){},5512:function(e,t,a){},5579:function(e,t,a){},5581:function(e,t,a){},5590:function(e,t,a){},5596:function(e,t,a){"use strict";a.r(t);var n=a(0),r=a.n(n),s=a(28),o=a.n(s),i=(a(5407),a(5409),a(5411),a(5413),a(8)),c=a.n(i),l=a(41),u=a(11),m=a(12),d=a(16),h=a(13),p=a(15),f=a(42),g=a(51),b=(a(5485),a(54)),v=a(35),E=a.n(v),w=function(e){function t(){return Object(u.a)(this,t),Object(d.a)(this,Object(h.a)(t).apply(this,arguments))}return Object(p.a)(t,e),Object(m.a)(t,[{key:"render",value:function(){return r.a.createElement("div",{className:"App transition-item detail-page darkTheme"},r.a.createElement(E.a,{className:"fullHeight"},r.a.createElement(b.ScaleLoader,{heightUnit:"em",widthUnit:"em",height:7,width:.6,color:"#3099bb"})))}}]),t}(n.Component),O=a(57),j=(a(5512),a(170)),y=a.n(j),k=a(59),N=function(e){document.getElementById(e).classList.remove("shake"),setTimeout(function(){document.getElementById(e).classList.add("shake")},10)},x=function(e){function t(e){var a;return Object(u.a)(this,t),(a=Object(d.a)(this,Object(h.a)(t).call(this,e)))._handleKeyPress=function(){var e=Object(l.a)(c.a.mark(function e(t){return c.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if("Enter"!==t.key){e.next=3;break}return e.next=3,a.login();case 3:case"end":return e.stop()}},e,this)}));return function(t){return e.apply(this,arguments)}}(),a.state={loading:!1,error:!1},a}return Object(p.a)(t,e),Object(m.a)(t,[{key:"render",value:function(){var e=this,t=this.props.classes,a=this.state.error;return r.a.createElement("div",{className:"App transition-item detail-page darkTheme"},r.a.createElement(E.a,{className:"fullHeight"},r.a.createElement("div",{id:"login-co",className:"loginContainer fadeIn animated"},r.a.createElement("div",{className:"logoContainer"},r.a.createElement("img",{src:y.a,alt:"Zation Logo",width:"110em",height:"110em",className:"logo"}),r.a.createElement("h1",{className:"logoText"},"LOG IN")),r.a.createElement("div",{className:"form"},r.a.createElement("div",{id:"username-co",className:"wrap-input100 validate-input animated "+(a?"wrap-input-error":""),"data-validate":"Enter username"},r.a.createElement("input",{onChange:function(){e.setState({error:!1})},id:"username",onKeyPress:this._handleKeyPress.bind(this),className:"input100",type:"text",name:"username",placeholder:"Username"}),r.a.createElement("span",{className:"focus-input100 focus-input-user"})),r.a.createElement("div",{id:"password-co",className:"wrap-input100 validate-input animated "+(a?"wrap-input-error":""),"data-validate":"Enter password"},r.a.createElement("input",{onChange:function(){e.setState({error:!1})},id:"password",onKeyPress:this._handleKeyPress.bind(this),className:"input100",type:"password",name:"username",placeholder:"Password"}),r.a.createElement("span",{className:"focus-input100 focus-input-lock"}))),r.a.createElement("div",{className:"btnContainer"},r.a.createElement(k.a,{disabled:this.state.loading,variant:"extended","aria-label":"Delete",onClick:this.login.bind(this),className:"btn loginBtn "+t.fab},this.state.loading?r.a.createElement(b.ClipLoader,{color:"white"}):"Login")))))}},{key:"login",value:function(){var e=Object(l.a)(c.a.mark(function e(){var t,a,n,r,s=this;return c.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if(t=document.getElementById("username").value,a=document.getElementById("password").value,n=!0,0===t.length&&(n=!1,N("username-co")),0===a.length&&(n=!1,N("password-co")),this.state.error&&(N("username-co"),N("password-co"),n=!1),!n){e.next=12;break}return this.setState({loading:!0}),r=Object(f.load)(),e.next=11,r.request().systemController(!0).controller("zation/panel/auth").data({username:t,password:a}).onSuccessful(function(){document.getElementById("login-co").classList.add("fadeOut"),setTimeout(function(){s.props.app.loadPanel()},500)}).onError(function(){s.setState({error:!0}),N("username-co"),N("password-co")}).send();case 11:this.setState({loading:!1});case 12:case"end":return e.stop()}},e,this)}));return function(){return e.apply(this,arguments)}}()}]),t}(n.Component),C=Object(O.withStyles)(function(e){return{fab:{margin:e.spacing.unit},extendedIcon:{marginRight:e.spacing.unit}}})(x),S=a(173),I=a.n(S),T=a(5602),A=(a(5573),a(5579),a(5581),function(e){function t(){return Object(u.a)(this,t),Object(d.a)(this,Object(h.a)(t).apply(this,arguments))}return Object(p.a)(t,e),Object(m.a)(t,[{key:"render",value:function(){return r.a.createElement("div",{className:"sidebar"})}}]),t}(n.Component)),P=function(e){function t(){return Object(u.a)(this,t),Object(d.a)(this,Object(h.a)(t).apply(this,arguments))}return Object(p.a)(t,e),Object(m.a)(t,[{key:"render",value:function(){return r.a.createElement("div",{className:"App transition-item detail-page"},r.a.createElement("header",{className:"App-header"},r.a.createElement(T.a,{bg:"dark",variant:"dark"},r.a.createElement(T.a.Brand,{href:"#home"},r.a.createElement("img",{alt:"",src:I.a,width:"30",height:"30",className:"d-inline-block align-top"})," Zation"))),r.a.createElement(A,null))}}]),t}(n.Component),L=(a(5590),a(101)),B=function(e){function t(){return Object(u.a)(this,t),Object(d.a)(this,Object(h.a)(t).apply(this,arguments))}return Object(p.a)(t,e),Object(m.a)(t,[{key:"render",value:function(){var e=this.props.classes;return r.a.createElement("div",{className:"App transition-item detail-page darkTheme"},r.a.createElement(E.a,{className:"fullHeight"},r.a.createElement("div",{className:"ErrorContainer"},r.a.createElement(L.b,{className:"warningIcon bounceInDown animated"}),r.a.createElement("h1",null,this.props.message),r.a.createElement(k.a,{variant:"extended","aria-label":"Delete",onClick:this.reload,className:"btn "+e.fab},r.a.createElement(L.a,{className:e.extendedIcon}),"Try again"))))}},{key:"reload",value:function(){document.location.reload(!0)}}]),t}(n.Component),M=Object(O.withStyles)(function(e){return{fab:{margin:e.spacing.unit},extendedIcon:{marginRight:e.spacing.unit}}})(B),D=function(e){function t(e){var a;return Object(u.a)(this,t),(a=Object(d.a)(this,Object(h.a)(t).call(this,e))).state={mode:"start",errorMessage:""},a}return Object(p.a)(t,e),Object(m.a)(t,[{key:"render",value:function(){return"start"===this.state.mode||"loadPanel"===this.state.mode?r.a.createElement(w,{app:this}):"auth"===this.state.mode?r.a.createElement(C,{app:this}):"panel"===this.state.mode?r.a.createElement(P,{app:this}):"error"===this.state.mode?r.a.createElement(M,{app:this,message:this.state.errorMessage}):void 0}},{key:"loadPanel",value:function(){var e=this;this.setState({mode:"loadPanel"}),setTimeout(function(){e.setState({mode:"panel"})},2500)}},{key:"toAuth",value:function(){var e=this;"start"===this.state.mode?setTimeout(function(){e.setState({mode:"auth"})},1500):this.setState({mode:"auth"})}},{key:"setError",value:function(e){var t=this;"start"===this.state.mode?setTimeout(function(){t.setState({mode:"error",errorMessage:e})},1500):this.setState({mode:"error",errorMessage:e})}},{key:"componentDidMount",value:function(){var e=this;"start"===this.state.mode&&Object(l.a)(c.a.mark(function t(){var a;return c.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return a=Object(f.create)({hostname:window.location.hostname,port:parseInt(window.location.port),debug:!1}),Object(f.save)(a),a.eventReact().onDisconnect(function(){setTimeout(function(){a.isConnected()||e.setError("The connection to the server is lost.")},5e3)}),a.eventReact().onServerDeauthenticate(function(){e.toAuth()}),t.prev=4,t.next=7,a.connect();case 7:a.isAuthenticated()&&a.getTokenPanelAccess()&&a.getTokenVariable("ZATION-PANEL-USER-NAME")?e.loadPanel():e.toAuth(),t.next=13;break;case 10:t.prev=10,t.t0=t.catch(4),t.t0 instanceof g.ConnectionAbortError&&e.setError("Could not connect to the server.");case 13:case"end":return t.stop()}},t,this,[[4,10]])}))()}},{key:"componentWillMount",value:function(){0}}]),t}(n.Component);Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));o.a.render(r.a.createElement(D,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then(function(e){e.unregister()})}},[[5396,2,1]]]);
//# sourceMappingURL=main.efb8df13.chunk.js.map