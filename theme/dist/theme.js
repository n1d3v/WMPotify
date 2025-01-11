(()=>{var _=1;function ye(e){_=e||1}function he(){if(Spicetify.Config.extensions.includes("noControls.js")){Spicetify.showNotification("[WMPotify] Incompatible extension 'No Controls' detected! Some features of WMPotify will be disabled.");return}let e=i=>{i&&(i._updateUiClient?.updateTitlebarHeight&&i._updateUiClient.updateTitlebarHeight({height:_}),i._updateUiClient?.setButtonsVisibility&&_<=1&&i._updateUiClient.setButtonsVisibility(!1),window.addEventListener("beforeunload",()=>{i._updateUiClient?.setButtonsVisibility&&i._updateUiClient.setButtonsVisibility({showButtons:!0})})),Spicetify.CosmosAsync.post("sp://messages/v1/container/control",{type:"update_titlebar",height:_+"px"})};e(Spicetify.Platform.ControlMessageAPI),e(Spicetify.Platform.UpdateAPI);async function n(){e(Spicetify.Platform.ControlMessageAPI),e(Spicetify.Platform.UpdateAPI)}let o=setInterval(n,100);setTimeout(()=>{clearInterval(o)},1e4);let t=()=>{e(Spicetify.Platform.ControlMessageAPI),e(Spicetify.Platform.UpdateAPI)};document.addEventListener("fullscreenchange",t),window.addEventListener("resize",()=>{setTimeout(()=>{t()},100)})}var k=ControlManager={init:he,setControlHeight:ye};function be(e,n){return this.canvas=this.canvas||document.createElement("canvas"),this.canvas.width=1,this.canvas.height=1,this.context=this.context||this.canvas.getContext("2d"),this.context.fillStyle="#EEF3FA",this.context.filter=`hue-rotate(${e}deg) saturate(${n}%)`,this.context.fillRect(0,0,1,1),"rgba("+this.context.getImageData(0,0,1,1).data+")"}function I(e,n){if(!e&&!n){document.documentElement.style.setProperty("--spice-main","#EEF3FA"),document.documentElement.style.removeProperty("--wmpotify-tint-hue"),document.documentElement.style.removeProperty("--wmpotify-tint-sat");return}document.documentElement.style.setProperty("--spice-main",be(e,n)),document.documentElement.style.setProperty("--wmpotify-tint-hue",e+"deg"),document.documentElement.style.setProperty("--wmpotify-tint-sat",n/100)}var c=null,x=[],f=WindhawkComm={init(){return ge()},query(){if(c){let e=c.query();if(e)return e.supportedCommands=x,e}return null},extendFrame(e,n,o,t){c&&x.includes("ExtendFrame")&&c.executeCommand(`/WH:ExtendFrame:${e}:${n}:${o}:${t}`)},minimize(){c&&x.includes("Minimize")&&c.executeCommand("/WH:Minimize")},maximizeRestore(){c&&x.includes("MaximizeRestore")&&c.executeCommand("/WH:MaximizeRestore")},close(){c&&x.includes("Close")&&c.executeCommand("/WH:Close")},setLayered(e,n,o){if(e=e?1:0,c){let t=[e];n&&t.push(n),o&&t.push(o),c.executeCommand("/WH:SetLayered:"+t.join(":"))}},setBackdrop(e){c&&c.executeCommand(`/WH:SetBackdrop:${e}`)},resizeTo(e,n){c&&c.executeCommand(`/WH:ResizeTo:${e}:${n}`)},setMinSize(e,n){c&&c.executeCommand(`/WH:SetMinSize:${e}:${n}`)},setTopMost(e){c&&c.executeCommand(`/WH:SetTopMost:${e?1:0}`)},available(){return c},getSupportedCommands(){return x}};function ge(){if(navigator.userAgent.includes("Windows"))try{c=window._getSpotifyModule("ctewh"),c.query(),x=c.supportedCommands;let{version:e,initialOptions:n}=c;return console.log(`CEF/Spotify Tweaks Windhawk mod available, Version: ${e}`),{version:e,initialOptions:n,supportedCommands:x}}catch{c=null,console.log("Windhawk mod not available")}}async function Y(e){let n=f.query();switch(e){case"native":k.setControlHeight(0);break;case"custom":k.setControlHeight(0);case"keepmenu":let o=document.createElement("div");if(o.id="wmpotify-title-buttons",window.SpotEx||n&&n.supportedCommands.includes("Minimize")){let s=document.createElement("button");s.id="wmpotify-minimize-button",s.addEventListener("click",()=>{window.SpotEx?SpotEx.updateWindow({state:"minimized"}):f.minimize()}),o.appendChild(s);let l=document.createElement("button");l.id="wmpotify-maximize-button",l.addEventListener("click",async()=>{window.SpotEx?(await SpotEx.getWindow()).state==="maximized"?SpotEx.updateWindow({state:"normal"}):SpotEx.updateWindow({state:"maximized"}):f.maximizeRestore()}),o.appendChild(l),window.addEventListener("resize",async()=>{window.SpotEx?(await SpotEx.getWindow()).state==="maximized"?l.dataset.maximized=!0:delete l.dataset.maximized:f.query().isMaximized?l.dataset.maximized=!0:delete l.dataset.maximized})}let t=document.createElement("button");t.id="wmpotify-close-button",t.addEventListener("click",()=>{K()}),o.appendChild(t);case"spotify":let i=document.createElement("div");i.id="wmpotify-title-bar";let r=document.createElement("div");r.id="wmpotify-title-icon",r.addEventListener("dblclick",()=>{K()}),i.appendChild(r);let a=document.createElement("span");a.id="wmpotify-title-text",a.textContent=await Spicetify.AppTitle.get(),i.appendChild(a),(e==="custom"||e==="keepmenu")&&i.appendChild(o),(e==="keepmenu"||e==="spotify")&&k.setControlHeight(25),document.body.appendChild(i),Spicetify.AppTitle.sub(s=>{a.textContent=s});break}}async function K(){f.query()?.supportedCommands?.includes("Close")?f.close():window.close()}var T=class{constructor(n=[],o=[]){this.menuOrder=n,this.submenus=o,this.openedMenu=null,this.mouseOverMenu=!1,this.mouseOverSubmenu=!1,this.handlingPointerEvent=!1,this.handlingKeyEvent=!1,this.boundMenuNavigationHandler=this.menuNavigationHandler.bind(this),this.submenuOpenTimer=null,this.submenuCloseTimer=null,this.shouldNotCloseSubmenu=!1,this.menuHierarchy={},this.beforeMenuOpenEvent=new Event("beforemenuopen"),this.afterMenuCloseEvent=new Event("aftermenuclose");for(let t of n){this.menuHierarchy[t]=[];let i=document.getElementById(t+"MenuBg"),r=i.querySelectorAll(".contextMenuItem");for(let a of r)a.dataset.submenu&&this.menuHierarchy[t].push(a.dataset.submenu),a.addEventListener("pointerover",()=>{for(let s of r)delete s.dataset.active;a.dataset.active=!0,clearTimeout(this.submenuOpenTimer),a.dataset.submenu?this.submenuOpenTimer=setTimeout(()=>{this.openMenu(a.dataset.submenu)},300):this.menuHierarchy[t].length>0&&this.delayedCloseMenu(this.menuHierarchy[t][0])}),a.addEventListener("pointerleave",()=>{this.mouseOverSubmenu||(delete a.dataset.active,clearTimeout(this.submenuOpenTimer),a.dataset.submenu&&this.delayedCloseMenu(a.dataset.submenu))}),a.addEventListener("click",()=>{a.dataset.submenu&&!a.classList.contains("disabled")?this.openedMenu.id!==a.dataset.submenu+"MenuBg"?this.openMenu(a.dataset.submenu):document.getElementById(a.dataset.submenu+"MenuBg").focus():a.dataset.noClose||this.closeMenu(t)});i.addEventListener("focusout",a=>{top.ignoreFocusLoss||a.relatedTarget&&a.relatedTarget.dataset.submenuOf===t||this.closeMenu(t)}),i.addEventListener("pointermove",a=>{(a.clientX>0||a.clientY>0)&&(i.style.animation="none")})}for(let t of o){let i=document.getElementById(t+"MenuBg"),r=i.querySelectorAll(".contextMenuItem"),a=document.getElementById(i.dataset.submenuOf+"MenuBg"),s=Array.from(a.querySelectorAll(".contextMenuItem")).findIndex(u=>u.dataset.submenu===t),l=a.querySelectorAll(".contextMenuItem")[s];for(let u of r)u.addEventListener("pointerover",()=>{for(let y of r)delete y.dataset.active;u.dataset.active=!0}),u.addEventListener("pointerleave",()=>{delete u.dataset.active}),u.addEventListener("click",()=>{this.shouldNotCloseSubmenu=!1,this.closeMenu(t),this.closeMenu(i.dataset.submenuOf)});i.addEventListener("pointerover",()=>{this.mouseOverMenu=!0,this.mouseOverSubmenu=!0,this.shouldNotCloseSubmenu=!0,clearTimeout(this.submenuCloseTimer),l.dataset.active=!0}),i.addEventListener("pointerleave",()=>{this.mouseOverMenu=!1,this.mouseOverSubmenu=!1,this.shouldNotCloseSubmenu=!1}),i.addEventListener("focusout",u=>{if(top.ignoreFocusLoss||i.style.display==="none")return;this.shouldNotCloseSubmenu=!1;let y=!!i.dataset.openStandalone;u.relatedTarget&&u.relatedTarget.id&&u.relatedTarget.id===a.id||(this.closeMenu(t),!(u.relatedTarget&&u.relatedTarget.id&&u.relatedTarget.dataset.submenuOf===i.dataset.submenuOf)&&(y||this.closeMenu(i.dataset.submenuOf)))})}}openMenu(n,o){let t=document.getElementById(n+"MenuBg"),i=document.getElementById(n+"Menu"),r=!!t.dataset.submenuOf,a,s,l,u=t.querySelectorAll(".contextMenuItem.debug");if(localStorage.wmpotifyDebugMode){l=t.querySelectorAll(".contextMenuItem:not([data-hidden])");for(let d of u)d.style.display=""}else{l=t.querySelectorAll(".contextMenuItem:not([data-hidden]):not(.debug)");for(let d of u)d.style.display="none"}if(t.dispatchEvent(this.beforeMenuOpenEvent),o)t.dataset.openStandalone=!0;else{if(r){if(this.menuHierarchy[t.dataset.submenuOf].length>1)for(let p of this.menuHierarchy[t.dataset.submenuOf])p!==n&&this.closeMenu(p);if(a=document.getElementById(t.dataset.submenuOf+"MenuBg"),a.style.display==="none")return;let d=Array.from(a.querySelectorAll(".contextMenuItem")).findIndex(p=>p.dataset.submenu===n);if(s=a.querySelectorAll(".contextMenuItem")[d],s.classList.contains("disabled"))return}else for(let d of this.menuOrder)d!==n&&document.getElementById(d+"MenuBg").style.display==="block"&&this.closeMenu(d);delete t.dataset.openStandalone}t.style.animation="";for(let d of l)delete d.dataset.active;if(o)o.top&&(t.style.top=o.top),o.left&&(t.style.left=o.left),o.right&&(t.style.right=o.right),o.bottom&&(t.style.bottom=o.bottom);else{let d="",p=0;r&&(d=a.offsetTop+s.offsetTop,p=a.offsetLeft+a.offsetWidth-6),t.style.top=d+"px",t.style.left=p+"px"}t.style.display="block";let y=this.calcMenuWidth(n);t.style.width=y+")",t.style.minWidth=0,i.style.width=y+" - 2px)",t.style.height=this.calcMenuHeight(n)+"px",o||r&&(s.dataset.active=!0),t.focus(),this.openedMenu=t,document.addEventListener("keydown",this.boundMenuNavigationHandler)}closeMenu(n){let o=document.getElementById(n+"MenuBg"),t=!!o.dataset.openStandalone,i=!!o.dataset.submenuOf&&!t;if(i&&this.shouldNotCloseSubmenu)return;let r,a;if(!t&&i){r=document.getElementById(o.dataset.submenuOf+"MenuBg");let s=Array.from(r.querySelectorAll(".contextMenuItem")).findIndex(l=>l.dataset.submenu===n);a=r.querySelectorAll(".contextMenuItem")[s]}this.submenuCloseTimer&&clearTimeout(this.submenuCloseTimer),o.style.display="none",t?delete o.dataset.openStandalone:i&&delete a.dataset.active,o.dispatchEvent(this.afterMenuCloseEvent),i&&r.style.display!=="none"?(r.focus(),this.openedMenu=r):(this.openedMenu=null,document.removeEventListener("keydown",this.boundMenuNavigationHandler))}delayedCloseMenu(n){this.submenuCloseTimer=setTimeout(()=>{this.closeMenu(n)},300)}menuNavigationHandler(n){if(!this.openedMenu)return;let o;localStorage.wmpotifyDebugMode?o=this.openedMenu.querySelectorAll(".contextMenuItem"):o=this.openedMenu.querySelectorAll(".contextMenuItem:not(.debug)");let t=this.openedMenu.querySelector(".contextMenuItem[data-active]"),i=Array.from(o).indexOf(t),r;switch(this.openedMenu.dataset.submenuOf&&(r=document.getElementById(this.openedMenu.dataset.submenuOf+"MenuBg").querySelector(".contextMenuItem[data-active]")),this.handlingKeyEvent=!0,this.openedMenu.style.animation="none",n.key){case"Escape":this.mouseOverMenu=!1,this.openedMenu.blur();break;case"ArrowUp":t?(delete t.dataset.active,i>0?o[i-1].dataset.active=!0:o[o.length-1].dataset.active=!0):o[o.length-1].dataset.active=!0;break;case"ArrowDown":t?(delete t.dataset.active,i<o.length-1?o[i+1].dataset.active=!0:o[0].dataset.active=!0):o[0].dataset.active=!0;break;case"ArrowLeft":if(this.openedMenu.dataset.submenuOf){this.closeMenu(this.openedMenu.id.slice(0,-6),!0),r.dataset.active=!0;break}if(this.menuOrder.length===1)break;let a=this.menuOrder[(this.menuOrder.indexOf(this.openedMenu.id.slice(0,-6))+this.menuOrder.length-1)%this.menuOrder.length];this.closeMenu(this.openedMenu.id.slice(0,-6)),this.openMenu(a),this.openedMenu.querySelector(".contextMenuItem").dataset.active=!0;break;case"ArrowRight":if(t&&t.dataset.submenu){this.openMenu(t.dataset.submenu),this.openedMenu.querySelector(".contextMenuItem").dataset.active=!0;break}if(this.menuOrder.length===1)break;let s;this.openedMenu.dataset.submenuOf?(s=this.menuOrder[(this.menuOrder.indexOf(this.openedMenu.dataset.submenuOf)+1)%this.menuOrder.length],this.closeMenu(this.openedMenu.id.slice(0,-6))):(s=this.menuOrder[(this.menuOrder.indexOf(this.openedMenu.id.slice(0,-6))+1)%this.menuOrder.length],this.closeMenu(this.openedMenu.id.slice(0,-6))),this.openMenu(s),this.openedMenu.querySelector(".contextMenuItem").dataset.active=!0;break;case"Enter":if(t)t.click();else{this.openedMenu.blur();break}break;default:let l=this.openedMenu.getElementsByTagName("u");for(let u of l)if(n.key===u.textContent.toLowerCase()){u.parentElement.click();break}}this.handlingKeyEvent=!1,n.preventDefault(),n.stopPropagation()}calcMenuWidth(n){let o=document.getElementById(n+"MenuBg"),t;localStorage.wmpotifyDebugMode?t=o.querySelectorAll(".contextMenuItem:not([data-hidden])"):t=o.querySelectorAll(".contextMenuItem:not([data-hidden]):not(.debug)"),o.style.minWidth="";let i=parseInt(getComputedStyle(o).minWidth)||0;return`calc(${Array.from(t).reduce((a,s)=>{let l=s.textContent,u=F(l);return Math.max(i,a,u)},0)}px + 4.5em`}calcMenuHeight(n){let o=document.getElementById(n+"MenuBg"),t=o.querySelectorAll("hr"),i;localStorage.wmpotifyDebugMode?i=o.querySelectorAll(".contextMenuItem:not([data-hidden])"):i=o.querySelectorAll(".contextMenuItem:not([data-hidden]):not(.debug)");let r=i[0].offsetHeight,a=0;if(t.length>0){let l=getComputedStyle(t[0]);a=t[0].offsetHeight+parseFloat(l.marginTop)+parseFloat(l.marginBottom)}return parseInt(i.length*r+t.length*a)}};function W(e,n,o){let t=document.createElement("div");return t.id=e+"MenuBg",t.className="contextMenuBg",t.tabIndex=-1,t.style.display="none",t.innerHTML=`<div id="${e}Menu" class="contextMenu"></div>`,o&&(t.dataset.submenuOf=o),n.forEach(i=>{if(i.hr){let a=document.createElement("hr");t.querySelector(".contextMenu").appendChild(a);return}let r=document.createElement("div");r.className="contextMenuItem",i.args?r.innerHTML="<p>"+G(i.text,...i.args)+"</p>":r.innerHTML="<p>"+G(i.text)+"</p>",i.classList&&r.classList.add(...i.classList),i.disabled&&r.classList.add("disabled"),i.hidden&&(r.dataset.hidden=!0),i.submenu&&(r.dataset.submenu=i.submenu,r.innerHTML+='<p class="submenuMark">\u23F5</p>'),i.noClose&&(r.dataset.noClose=!0),r.addEventListener("click",i.click),t.querySelector(".contextMenu").appendChild(r)}),document.body.appendChild(t),{menuBg:t,menu:t.querySelector(".contextMenu"),menuItems:t.querySelectorAll(".contextMenuItem")}}function F(e,n=getComputedStyle(document.documentElement).getPropertyValue("--menu-font")){let t=(F.canvas||(F.canvas=document.createElement("canvas"))).getContext("2d");return t.font=n,t.measureText(e).width}function G(e){if(e=e.replace(/&([^&])/g,"<u>$1</u>").replace(/\\&/g,"&"),arguments.length>1)for(let n=1;n<arguments.length;n++)e=e.replace(/%s/,arguments[n]),e=e.replace(`%${n}s`,arguments[n]);return e}var C,S=[],q,we={"Your Library":"Library","Friend Activity":"Friends"};function Z(){let e=document.querySelector(".Root__globalNav");C=document.createElement("div"),C.id="wmpotify-tabs-container",e.insertBefore(C,e.querySelector(".main-globalNav-searchSection"));let n=document.querySelector(".main-globalNav-searchContainer > button");O(n);let o=document.querySelector(".main-globalNav-searchContainer div form button");o.addEventListener("click",h=>{window.open("spotify:search"),h.preventDefault(),h.stopPropagation()}),O(o),S=[n,o];let t=document.querySelectorAll('.custom-navlinks-scrollable_container div[role="presentation"] > button');for(let h of t)O(h),S.push(h);let i=document.querySelectorAll(".main-topBar-topbarContentRight > .main-actionButtons > button");for(let h of i)O(h),S.push(h);let r=[];for(let h of S)r.push({text:h.querySelector(".wmpotify-tab-label").textContent,click:()=>h.click()});W("wmpotifyTab",r);let a=new T(["wmpotifyTab"]);q=document.createElement("button"),q.id="wmpotify-tabs-overflow-button",q.addEventListener("click",()=>{a.openMenu("wmpotifyTab",{top:"0",left:q.getBoundingClientRect().left+"px"})}),C.appendChild(q),N(),setTimeout(N,1e3),window.addEventListener("resize",N);let s=document.querySelector(".main-topBar-topbarContentRight > button:last-child"),l=document.createElement("span");l.textContent=s.getAttribute("aria-label"),l.classList.add("wmpotify-user-label"),s.appendChild(l);let u=document.createElement("div");u.id="wmpotify-search-container";let y=document.createElement("div");y.id="wmpotify-search-wrapper";let d=document.querySelector(".main-topBar-searchBar");y.appendChild(d);let p=document.createElement("button");p.id="wmpotify-search-clear-button",p.setAttribute("aria-label","Clear search"),p.addEventListener("click",()=>{d.value="",d.focus(),window.open("spotify:search")}),y.appendChild(p),u.appendChild(y),e.appendChild(u)}function O(e){C.appendChild(e);let n=document.createElement("span"),o=e.getAttribute("aria-label");n.textContent=we[o]||o,n.classList.add("wmpotify-tab-label"),e.appendChild(n)}function N(){let e=document.querySelector(".main-globalNav-historyButtons").getBoundingClientRect().right,n=window.innerWidth-document.querySelector(".main-topBar-topbarContentRight").getBoundingClientRect().left,o=160,t=0;for(;window.innerWidth-e-n-o<C.getBoundingClientRect().width&&t<S.length;)S[S.length-1-t++].dataset.hidden=!0;for(t=document.querySelectorAll("#wmpotify-tabs-container button[data-hidden]").length;t>0&&window.innerWidth-e-n-o>C.getBoundingClientRect().width;)delete S[S.length-t--].dataset.hidden;q.style.display=t>0?"block":""}function H(e,n){if(!e||isNaN(e))return"00:00";let o=Math.floor(e/1e3),t=Math.floor(o/60);if(o=String(o%60).padStart(2,"0"),t<60)return n&&(t=String(t).padStart(2,"0")),`${t}:${o}`;let i=Math.floor(t/60);return t=String(t%60).padStart(2,"0"),n&&(i=String(i).padStart(2,"0")),`${i}:${t}:${o}`}var D,B,$,z,E,v;function ne(){D=document.querySelector(".player-controls__buttons button[data-testid='control-button-playpause']"),Spicetify.Player.addEventListener("onplaypause",P),new MutationObserver(P).observe(D,{attributes:!0,attributeFilter:["aria-label"]}),J(),new MutationObserver(J).observe(document.querySelector(".main-nowPlayingBar-left"),{childList:!0});let e=document.querySelector(".player-controls__left"),n=document.querySelector('.player-controls__buttons button[data-testid="control-button-skip-back"]'),o=document.querySelector('.player-controls__buttons button[data-testid="control-button-repeat"]');e.insertBefore(o,n);let t=document.createElement("button");t.setAttribute("aria-label","Stop"),t.id="wmpotify-stop-button",t.addEventListener("click",()=>{Spicetify.Platform.PlayerAPI.clearQueue(),Spicetify.Player.playUri("")}),e.insertBefore(t,n);let i=document.querySelector(".player-controls__right"),r=document.querySelector(".volume-bar");B=r.querySelector(".volume-bar__icon-button"),$=r.querySelector(".progress-bar"),ee(),new MutationObserver(ee).observe($,{attributes:!0,attributeFilter:["style"]}),i.appendChild(r),z=document.querySelectorAll(".playback-bar .encore-text");let a=document.createElement("div");a.classList.add("wmpotify-time-text-container"),v=document.createElement("span"),v.classList.add("wmpotify-time-text"),E=parseInt(localStorage.wmpotifyTimeTextMode||0),te(),v.dataset.mode=E,v.addEventListener("click",()=>{E=(E+1)%3,v.dataset.mode=E,localStorage.wmpotifyTimeTextMode=E}),a.appendChild(v),e.insertAdjacentElement("afterbegin",a),Spicetify.Player.addEventListener("onprogress",te);let s=new MutationObserver(()=>{let l=e.children.length;l!==4&&(s.disconnect(),e.insertBefore(e.children[l-2],o),s.observe(e,{childList:!0}))});s.observe(e,{childList:!0})}function J(){P();let e=document.querySelector(".main-nowPlayingWidget-trackInfo");if(!e||document.querySelector(".wmpotify-track-info"))return;let n=document.createElement("p");n.classList.add("wmpotify-track-info"),n.textContent=document.querySelector(".main-trackInfo-name")?.textContent||"",e.appendChild(n);let o=1;setInterval(()=>{if(!Spicetify.Player.isPlaying())return;let t=Spicetify.Player.data?.item.metadata;t&&(o===0?n.textContent=t.title:o===1?n.textContent=t.artist_name:o===2&&(n.textContent=t.album_title),o=(o+1)%3)},3e3),Spicetify.Player.addEventListener("songchange",()=>{o=0,n.textContent=Spicetify.Player.data?.item.metadata.title})}function P(){D.classList.toggle("playing",Spicetify.Player.isPlaying());let e=document.querySelector(`.playlist-playlist-playlist[data-test-uri="${Spicetify.Player.data?.context?.uri}"]`);e&&e.classList.toggle("playing",Spicetify.Player.isPlaying())}function ee(){let e=getComputedStyle($).getPropertyValue("--progress-bar-transform").replace("%","")/100;e===0?B.dataset.vol="muted":e<=.3?B.dataset.vol="low":e<=.6?B.dataset.vol="mid":B.dataset.vol="high"}function te(){switch(E){case 0:{let e=Spicetify.Player.data?.item?.metadata?.duration-Spicetify.Player.getProgress();v.textContent=H(e,!0)}break;case 1:{let e=z[0].textContent;(e.length===4||e.length===7)&&(e="0"+e),v.textContent=e}break;case 2:{let e=z[0].textContent;(e.length===4||e.length===7)&&(e="0"+e);let n=z[1].textContent;(n.length===4||n.length===7)&&(n="0"+n),v.textContent=`${e} / ${n}`}break}}var m=document.createElement("div"),M=null,V=0,b={title:null,hue:null,sat:null};function Se(){if(document.getElementById("wmpotify-config"))return;let e=document.querySelector(".Root__main-view");m.id="wmpotify-config",m.innerHTML=`
        <div id="wmpotify-config-topborder" class="wmpotify-tintable"></div>
        <button id="wmpotify-config-prev"></button>
        <button id="wmpotify-config-next"></button>
        <p id="wmpotify-config-title">Color Chooser</p>
        <button id="wmpotify-config-close"></button>
        <section class="wmpotify-config-tab-content" data-tab-title="Color Chooser" style="display: block;">
            <a href="#" id="wmpotify-config-color-reset">Reset</a><br>
            <label>Hue</label><br>
            <input type="range" id="wmpotify-config-hue" class="wmpotify-aero no-track" min="0" max="360" step="1" value="180"><br>
            <label>Saturation</label><br>
            <input type="range" id="wmpotify-config-sat" class="wmpotify-aero no-track" min="0" max="354" step="1" value="121"><br>
        </section>
        <section class="wmpotify-config-tab-content" data-tab-title="General">
            <label for="wmpotify-config-style">Style</label>
            <select id="wmpotify-config-style" class="wmpotify-aero">
                <option value="auto">Auto</option>
                <option value="xp">XP</option>
                <option value="aero">Aero</option>
                <option value="basic">Basic</option>
            </select><br>
            <label for="wmpotify-config-title-style">Title style</label>
            <select id="wmpotify-config-title-style" class="wmpotify-aero">
                <option value="auto">Auto</option>
                <option value="native">Native</option>
                <option value="custom">Custom</option>
                <option value="spotify">Spotify</option>
                <option value="keepmenu">Keep Menu</option>
            </select><br>
            <input type="checkbox" id="wmpotify-config-show-libx" class="wmpotify-aero">
            <label for="wmpotify-config-show-libx">Show Your Library X on the left sidebar</label><br>
            <button id="wmpotify-config-apply" class="wmpotify-aero">Apply</button>
        </section>
        <section class="wmpotify-config-tab-content" data-tab-title="About">
            <span style="color: lightgray;">WMPotify for Spicetify by Ingan121</span><br>
            <a href="https://github.com/Ingan121/WMPotify" target="_blank">GitHub</a>
        </section>
    `,m.querySelector("#wmpotify-config-close").addEventListener("click",U),m.querySelector("#wmpotify-config-apply").addEventListener("click",re),M=m.querySelectorAll(".wmpotify-config-tab-content"),b.title=m.querySelector("#wmpotify-config-title"),b.hue=m.querySelector("#wmpotify-config-hue"),b.sat=m.querySelector("#wmpotify-config-sat"),b.hue.addEventListener("input",oe),b.sat.addEventListener("input",oe),m.querySelector("#wmpotify-config-color-reset").addEventListener("click",Me),m.querySelector("#wmpotify-config-prev").addEventListener("click",ie),m.querySelector("#wmpotify-config-next").addEventListener("click",ae),localStorage.wmpotifyStyle&&(m.querySelector("#wmpotify-config-style").value=localStorage.wmpotifyStyle);let n=m.querySelector("#wmpotify-config-title-style");navigator.userAgent.includes("Windows")||n.querySelector("option[value=keepmenu]").remove(),navigator.userAgent.includes("Linux")&&n.querySelector("option[value=spotify]").remove(),localStorage.wmpotifyTitleStyle&&(n.value=localStorage.wmpotifyTitleStyle),localStorage.wmpotifyShowLibX&&(m.querySelector("#wmpotify-config-show-libx").checked=!0),e.appendChild(m)}function ve(){if(M){if(m.style.display==="block"){U();return}if(m.style.display="block",localStorage.wmpotifyTintColor){let[e,n]=localStorage.wmpotifyTintColor.split(",");b.hue.value=parseInt(e)+180,b.sat.value=parseInt(n)*121/100}}}function U(){m.style.display="none"}function Q(e){if(M){for(let n=0;n<M.length;n++){let o=M[n];o.style.display=n===e?"block":"none"}V=e,b.title.textContent=M[e].dataset.tabTitle}}function ie(){Q((V-1+M.length)%M.length)}function ae(){Q((V+1)%M.length)}function oe(){let e=b.hue.value-180,n=b.sat.value*100/121;I(e,n),localStorage.wmpotifyTintColor=e+","+n}function Me(){b.hue.value=180,b.sat.value=121,I(),delete localStorage.wmpotifyTintColor}function re(){let e=m.querySelector("#wmpotify-config-style").value,n=m.querySelector("#wmpotify-config-title-style").value,o=m.querySelector("#wmpotify-config-show-libx").checked;e!=="auto"?localStorage.wmpotifyStyle=e:delete localStorage.wmpotifyStyle,n!=="auto"?localStorage.wmpotifyTitleStyle=n:delete localStorage.wmpotifyTitleStyle,o?localStorage.wmpotifyShowLibX=!0:delete localStorage.wmpotifyShowLibX,location.reload()}var j=Config={init:Se,open:ve,close:U,openTab:Q,prevTab:ie,nextTab:ae,apply:re,isOpen:()=>m.style.display==="block"};function X(){if(!document.querySelector("#queue-panel")||document.querySelector("#wmpotify-queue-toolbar")||document.querySelectorAll('div[data-encore-id="tabPanel"]').length>2)return;let e=document.querySelector("#Desktop_PanelContainer_Id"),n=document.querySelector("#Desktop_PanelContainer_Id > div > div:first-child > div:first-child"),o=document.querySelector("#Desktop_PanelContainer_Id > div > div:nth-child(2)"),t=document.createElement("div");t.id="wmpotify-queue-toolbar";let i=document.createElement("button");i.id="wmpotify-queue-playlist-button",i.classList.add("wmpotify-toolbar-button"),i.addEventListener("click",()=>{let w=Spicetify.Player.data?.context?.uri;w&&window.open(w)}),i.textContent=document.querySelector('#queue-panel div[data-flip-id*="section-header-"] a')?.textContent||"Now Playing",i.innerHTML+='<span class="expandMark">\u23F7</span>',t.appendChild(i);let r=document.createElement("button");r.id="wmpotify-queue-clear-button",r.classList.add("wmpotify-toolbar-button"),r.addEventListener("click",()=>{Spicetify.Platform.PlayerAPI.clearQueue(),Spicetify.Player.playUri("")}),t.appendChild(r),o.insertAdjacentElement("afterbegin",t);let a=getComputedStyle(document.documentElement).getPropertyValue("--album-art-placeholder").trim().slice(5,-2),s=document.createElement("div");s.id="wmpotify-queue-npv";let l=document.createElement("img");l.id="wmpotify-queue-album-art",l.src=document.querySelector(".main-nowPlayingWidget-coverArt .cover-art img")?.src||a,s.appendChild(l);let u=document.createElement("div");u.id="wmpotify-queue-song-title",u.textContent=document.querySelector(".main-trackInfo-name")?.textContent||"No items",s.appendChild(u),n.insertAdjacentElement("afterbegin",s),se(),new MutationObserver(se).observe(document.querySelector("#queue-panel"),{childList:!0});let y=document.querySelectorAll('#Desktop_PanelContainer_Id div[role="tablist"] button'),d=[],p;for(let w of y)d.push({text:w.textContent,click:function(){for(let fe of p.menuItems)fe.classList.remove("activeStyle");this.classList.add("activeStyle"),w.click()}});d[0].classList=["activeStyle"],document.querySelector("#wmpotifyQueueTabMenuBg")?.remove(),p=W("wmpotifyQueueTab",d);let h=new T(["wmpotifyQueueTab"]);e.addEventListener("contextmenu",w=>{w.preventDefault(),h.openMenu("wmpotifyQueueTab",{left:w.clientX+"px",top:w.clientY+"px"})}),Spicetify.Player.addEventListener("songchange",()=>{i.textContent=Spicetify.Player.data?.context?.metadata?.context_description||"Now Playing",i.innerHTML+='<span class="expandMark">\u23F7</span>',l.src=Spicetify.Player.data?.item?.album?.images?.[0]?.url?.replace("spotify:image:","https://i.scdn.co/image/")||a,u.textContent=Spicetify.Player.data?.item?.name||"No items"})}function se(){let e=document.querySelectorAll("#queue-panel ul")[1];e&&(le(),new MutationObserver(le).observe(e,{childList:!0}))}function le(){if(!document.querySelector("#queue-panel")||!Spicetify.Queue)return;let e=document.querySelectorAll("#queue-panel li .HeaderArea");for(let n=0;n<e.length;n++){let o=e[n];if(o.querySelector(".wmpotify-queue-duration"))continue;let t=n===0?Spicetify.Queue.track?.contextTrack?.metadata?.duration:Spicetify.Queue.nextTracks?.[n-1]?.contextTrack?.metadata?.duration;if(!t)continue;let i=document.createElement("span");i.classList.add("wmpotify-queue-duration"),i.textContent=H(t),o.appendChild(i)}}var L=null,ue=null;var xe=!1;var R=96;var Ke=new Array(R).fill(0),Ye=new Array(R).fill(0),Ge=new Array(R).fill(0),Ze=new Array(R).fill(0);function Ce(){let e=L.getBoundingClientRect();L.height=e.height,L.width=e.width,ue.height=L.height,ue.width=L.width,xe=!1}window.addEventListener("resize",Ce);var ce=`
<div id="topbar">
    <div id="topbar-right">
        <button id="lyrics-button" class="topbar-button"></button>
        <button id="return-button" class="topbar-button"></button>
        <button id="close-button" class="topbar-button"></button>
    </div>
</div>
<div id="main">
    <div id="visualizer"></div>
    <div id="album-art"></div>
    <div id="lyrics"></div>
</div>
<div id="playerbar">
    <div id="info">
        <div id="status-icon"></div>
        <div id="info-text">
    </div>
    <div id="controls">
        <input id="seek-bar" type="range" min="0" max="100" value="0" step="1">
        <button id="playpause-button"></button>
        <button id="stop-button"></button>
        <button id="previous-button"></button>
        <button id="next-button"></button>
        <button id="mute-button"></button>
        <input id="volume-bar" type="range" min="0" max="100" value="100" step="1">
    </div>
</div>
`;function de(e){e.document.body.id="wmpotify-dpip-corporate"}async function me(e){let{init:n,body:o}=Ee(e);if(n&&o&&window.documentPictureInPicture){let t=await documentPictureInPicture.requestWindow();if(t){t.document.title="Spotify",t.document.body.innerHTML=o;let i=t.document.createElement("link");i.rel="icon",i.href=getComputedStyle(document.documentElement).getPropertyValue("--logo-16").slice(5,-2),t.document.head.appendChild(i);let r=document.querySelector('link.userCSS[href*="user.css"]');r&&t.document.head.appendChild(r.cloneNode()),n(t)}}}function Ee(e){switch(e){case"corporate":return{init:de,body:ce};default:return null}}globalThis.WindhawkComm=f;globalThis.initCustomDPiP=me;var pe=[".Root__globalNav",".main-globalNav-historyButtons",".main-globalNav-searchSection",".main-globalNav-searchContainer > button",".main-globalNav-searchContainer div form button",".main-topBar-searchBar",'.custom-navlinks-scrollable_container div[role="presentation"] > button',".main-topBar-topbarContentRight > .main-actionButtons > button",".main-topBar-topbarContentRight > button:last-child",".Root__main-view",".main-view-container__scroll-node-child main",".player-controls__left",'.player-controls__buttons button[data-testid="control-button-skip-back"]','.player-controls__buttons button[data-testid="control-button-repeat"]','.player-controls__buttons button[data-testid="control-button-playpause"]',".player-controls__right",".playback-bar .encore-text",".volume-bar",".volume-bar__icon-button",".volume-bar .progress-bar",".main-nowPlayingBar-left",".Root__right-sidebar div[class]"],A="xp",g="spotify";function ke(){localStorage.wmpotifyShowLibX||(document.body.dataset.hideLibx=!0),f.init();let e=f.query();switch(e&&!localStorage.wmpotifyStyle&&window.outerHeight-window.innerHeight>0&&e.isThemingEnabled&&(e.supportedCommands.includes("ExtendFrame")&&e.options.transparentrendering&&e.isDwmEnabled?A="aero":e.isDwmEnabled||(A="basic")),localStorage.wmpotifyStyle&&["xp","aero","basic"].includes(localStorage.wmpotifyStyle)&&(A=localStorage.wmpotifyStyle),f.setBackdrop("mica"),A){case"xp":f.extendFrame(0,0,0,0);break;case"aero":f.extendFrame(0,0,0,60);break;case"basic":f.extendFrame(0,0,0,0),document.hasFocus()?document.body.style.backgroundColor="#b9d1ea":document.body.style.backgroundColor="#d7e4f2",window.addEventListener("focus",()=>{document.body.style.backgroundColor="#b9d1ea"}),window.addEventListener("blur",()=>{document.body.style.backgroundColor="#d7e4f2"});break}document.documentElement.dataset.wmpotifyStyle=A,localStorage.wmpotifyTitleStyle&&["native","custom","spotify","keepmenu"].includes(localStorage.wmpotifyTitleStyle)?g=localStorage.wmpotifyTitleStyle:(console.log("WMPotify EarlyInit:",window.SpotEx,e),window.outerHeight-window.innerHeight>0?g="native":(window.SpotEx||e?.supportedCommands?.includes("Minimize"))&&(e?.options?.showmenu&&!e.options.showcontrols?g="keepmenu":g="custom")),g==="keepmenu"&&!navigator.userAgent.includes("Windows")&&(g="spotify"),g==="spotify"&&navigator.userAgent.includes("Linux")&&(g="native"),document.documentElement.dataset.wmpotifyTitleStyle=g}ke();async function Te(){if(await Y(g),localStorage.wmpotifyTintColor){let[e,n]=localStorage.wmpotifyTintColor.split(",");I(e,n)}k.init(),Z(),j.init(),new Spicetify.Menu.Item("WMPotify Properties",!1,j.open).register(),ne(),new MutationObserver(P).observe(document.querySelector(".main-view-container__scroll-node-child main"),{childList:!0}),X(),new MutationObserver(X).observe(document.querySelector(".Root__right-sidebar div[class]"),{childList:!0})}function qe(){return window.Spicetify&&window.Spicetify.CosmosAsync&&window.Spicetify.Platform?.PlayerAPI&&window.Spicetify.AppTitle&&window.Spicetify.Player?.origin?._state&&window.Spicetify.Menu&&pe.every(e=>document.querySelector(e))}window.addEventListener("load",()=>{let e=0,n=setInterval(async()=>{if(qe()){clearInterval(n);try{await Te()}catch(o){(Spicetify.showNotification||window.alert)("[WMPotify] An error occurred during initialization. Please check the console for more information."),console.error("WMPotify: Error during init:",o)}console.log("WMPotify: Theme loaded")}else if(e++>80){(Spicetify.showNotification||window.alert)("[WMPotify] Theme loading failed. Please refresh the page to try again. Please make sure you have compatible Spoitfy version and have global navbar enabled."),clearInterval(n);let o=[];for(let t of pe)document.querySelector(t)||o.push(t);console.log("WMPotify: Missing elements:",o)}},100)});})();
