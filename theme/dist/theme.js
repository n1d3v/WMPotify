(()=>{var x=class{constructor(i=[],n=[]){this.menuOrder=i,this.submenus=n,this.openedMenu=null,this.mouseOverMenu=!1,this.mouseOverSubmenu=!1,this.handlingPointerEvent=!1,this.handlingKeyEvent=!1,this.boundMenuNavigationHandler=this.menuNavigationHandler.bind(this),this.submenuOpenTimer=null,this.submenuCloseTimer=null,this.shouldNotCloseSubmenu=!1,this.menuHierarchy={},this.beforeMenuOpenEvent=new Event("beforemenuopen"),this.afterMenuCloseEvent=new Event("aftermenuclose");for(let e of i){this.menuHierarchy[e]=[];let t=document.getElementById(e+"MenuBg"),a=t.querySelectorAll(".contextMenuItem");for(let o of a)o.dataset.submenu&&this.menuHierarchy[e].push(o.dataset.submenu),o.addEventListener("pointerover",()=>{for(let u of a)delete u.dataset.active;o.dataset.active=!0,clearTimeout(this.submenuOpenTimer),o.dataset.submenu?this.submenuOpenTimer=setTimeout(()=>{this.openMenu(o.dataset.submenu)},300):this.menuHierarchy[e].length>0&&this.delayedCloseMenu(this.menuHierarchy[e][0])}),o.addEventListener("pointerleave",()=>{this.mouseOverSubmenu||(delete o.dataset.active,clearTimeout(this.submenuOpenTimer),o.dataset.submenu&&this.delayedCloseMenu(o.dataset.submenu))}),o.addEventListener("click",()=>{o.dataset.submenu&&!o.classList.contains("disabled")?this.openedMenu.id!==o.dataset.submenu+"MenuBg"?this.openMenu(o.dataset.submenu):document.getElementById(o.dataset.submenu+"MenuBg").focus():o.dataset.noClose||this.closeMenu(e)});t.addEventListener("focusout",o=>{top.ignoreFocusLoss||o.relatedTarget&&o.relatedTarget.dataset.submenuOf===e||this.closeMenu(e)}),t.addEventListener("pointermove",o=>{(o.clientX>0||o.clientY>0)&&(t.style.animation="none")})}for(let e of n){let t=document.getElementById(e+"MenuBg"),a=t.querySelectorAll(".contextMenuItem"),o=document.getElementById(t.dataset.submenuOf+"MenuBg"),u=Array.from(o.querySelectorAll(".contextMenuItem")).findIndex(s=>s.dataset.submenu===e),d=o.querySelectorAll(".contextMenuItem")[u];for(let s of a)s.addEventListener("pointerover",()=>{for(let h of a)delete h.dataset.active;s.dataset.active=!0}),s.addEventListener("pointerleave",()=>{delete s.dataset.active}),s.addEventListener("click",()=>{this.shouldNotCloseSubmenu=!1,this.closeMenu(e),this.closeMenu(t.dataset.submenuOf)});t.addEventListener("pointerover",()=>{this.mouseOverMenu=!0,this.mouseOverSubmenu=!0,this.shouldNotCloseSubmenu=!0,clearTimeout(this.submenuCloseTimer),d.dataset.active=!0}),t.addEventListener("pointerleave",()=>{this.mouseOverMenu=!1,this.mouseOverSubmenu=!1,this.shouldNotCloseSubmenu=!1}),t.addEventListener("focusout",s=>{if(top.ignoreFocusLoss||t.style.display==="none")return;this.shouldNotCloseSubmenu=!1;let h=!!t.dataset.openStandalone;s.relatedTarget&&s.relatedTarget.id&&s.relatedTarget.id===o.id||(this.closeMenu(e),!(s.relatedTarget&&s.relatedTarget.id&&s.relatedTarget.dataset.submenuOf===t.dataset.submenuOf)&&(h||this.closeMenu(t.dataset.submenuOf)))})}}openMenu(i,n){let e=document.getElementById(i+"MenuBg"),t=document.getElementById(i+"Menu"),a=!!e.dataset.submenuOf,o,u,d,s=e.querySelectorAll(".contextMenuItem.debug");if(localStorage.wmpotifyDebugMode){d=e.querySelectorAll(".contextMenuItem:not([data-hidden])");for(let m of s)m.style.display=""}else{d=e.querySelectorAll(".contextMenuItem:not([data-hidden]):not(.debug)");for(let m of s)m.style.display="none"}if(e.dispatchEvent(this.beforeMenuOpenEvent),n)e.dataset.openStandalone=!0;else{if(a){if(this.menuHierarchy[e.dataset.submenuOf].length>1)for(let b of this.menuHierarchy[e.dataset.submenuOf])b!==i&&this.closeMenu(b);if(o=document.getElementById(e.dataset.submenuOf+"MenuBg"),o.style.display==="none")return;let m=Array.from(o.querySelectorAll(".contextMenuItem")).findIndex(b=>b.dataset.submenu===i);if(u=o.querySelectorAll(".contextMenuItem")[m],u.classList.contains("disabled"))return}else for(let m of this.menuOrder)m!==i&&document.getElementById(m+"MenuBg").style.display==="block"&&this.closeMenu(m);delete e.dataset.openStandalone}e.style.animation="";for(let m of d)delete m.dataset.active;if(n)n.top&&(e.style.top=n.top),n.left&&(e.style.left=n.left),n.right&&(e.style.right=n.right),n.bottom&&(e.style.bottom=n.bottom);else{let m="",b=0;a&&(m=o.offsetTop+u.offsetTop,b=o.offsetLeft+o.offsetWidth-6),e.style.top=m+"px",e.style.left=b+"px"}e.style.display="block";let h=this.calcMenuWidth(i);e.style.width=h+")",e.style.minWidth=0,t.style.width=h+" - 2px)",e.style.height=this.calcMenuHeight(i)+"px",n||a&&(u.dataset.active=!0),e.focus(),this.openedMenu=e,document.addEventListener("keydown",this.boundMenuNavigationHandler)}closeMenu(i){let n=document.getElementById(i+"MenuBg"),e=!!n.dataset.openStandalone,t=!!n.dataset.submenuOf&&!e;if(t&&this.shouldNotCloseSubmenu)return;let a,o;if(!e&&t){a=document.getElementById(n.dataset.submenuOf+"MenuBg");let u=Array.from(a.querySelectorAll(".contextMenuItem")).findIndex(d=>d.dataset.submenu===i);o=a.querySelectorAll(".contextMenuItem")[u]}this.submenuCloseTimer&&clearTimeout(this.submenuCloseTimer),n.style.display="none",e?delete n.dataset.openStandalone:t&&delete o.dataset.active,n.dispatchEvent(this.afterMenuCloseEvent),t&&a.style.display!=="none"?(a.focus(),this.openedMenu=a):(this.openedMenu=null,document.removeEventListener("keydown",this.boundMenuNavigationHandler))}delayedCloseMenu(i){this.submenuCloseTimer=setTimeout(()=>{this.closeMenu(i)},300)}menuNavigationHandler(i){if(!this.openedMenu)return;let n;localStorage.wmpotifyDebugMode?n=this.openedMenu.querySelectorAll(".contextMenuItem"):n=this.openedMenu.querySelectorAll(".contextMenuItem:not(.debug)");let e=this.openedMenu.querySelector(".contextMenuItem[data-active]"),t=Array.from(n).indexOf(e),a;switch(this.openedMenu.dataset.submenuOf&&(a=document.getElementById(this.openedMenu.dataset.submenuOf+"MenuBg").querySelector(".contextMenuItem[data-active]")),this.handlingKeyEvent=!0,this.openedMenu.style.animation="none",i.key){case"Escape":this.mouseOverMenu=!1,this.openedMenu.blur();break;case"ArrowUp":e?(delete e.dataset.active,t>0?n[t-1].dataset.active=!0:n[n.length-1].dataset.active=!0):n[n.length-1].dataset.active=!0;break;case"ArrowDown":e?(delete e.dataset.active,t<n.length-1?n[t+1].dataset.active=!0:n[0].dataset.active=!0):n[0].dataset.active=!0;break;case"ArrowLeft":if(this.openedMenu.dataset.submenuOf){this.closeMenu(this.openedMenu.id.slice(0,-6),!0),a.dataset.active=!0;break}if(this.menuOrder.length===1)break;let o=this.menuOrder[(this.menuOrder.indexOf(this.openedMenu.id.slice(0,-6))+this.menuOrder.length-1)%this.menuOrder.length];this.closeMenu(this.openedMenu.id.slice(0,-6)),this.openMenu(o),this.openedMenu.querySelector(".contextMenuItem").dataset.active=!0;break;case"ArrowRight":if(e&&e.dataset.submenu){this.openMenu(e.dataset.submenu),this.openedMenu.querySelector(".contextMenuItem").dataset.active=!0;break}if(this.menuOrder.length===1)break;let u;this.openedMenu.dataset.submenuOf?(u=this.menuOrder[(this.menuOrder.indexOf(this.openedMenu.dataset.submenuOf)+1)%this.menuOrder.length],this.closeMenu(this.openedMenu.id.slice(0,-6))):(u=this.menuOrder[(this.menuOrder.indexOf(this.openedMenu.id.slice(0,-6))+1)%this.menuOrder.length],this.closeMenu(this.openedMenu.id.slice(0,-6))),this.openMenu(u),this.openedMenu.querySelector(".contextMenuItem").dataset.active=!0;break;case"Enter":if(e)e.click();else{this.openedMenu.blur();break}break;default:let d=this.openedMenu.getElementsByTagName("u");for(let s of d)if(i.key===s.textContent.toLowerCase()){s.parentElement.click();break}}this.handlingKeyEvent=!1,i.preventDefault(),i.stopPropagation()}calcMenuWidth(i){let n=document.getElementById(i+"MenuBg"),e;localStorage.wmpotifyDebugMode?e=n.querySelectorAll(".contextMenuItem:not([data-hidden])"):e=n.querySelectorAll(".contextMenuItem:not([data-hidden]):not(.debug)"),n.style.minWidth="";let t=parseInt(getComputedStyle(n).minWidth)||0;return`calc(${Array.from(e).reduce((o,u)=>{let d=u.textContent,s=V(d);return Math.max(t,o,s)},0)}px + 4.5em`}calcMenuHeight(i){let n=document.getElementById(i+"MenuBg"),e=n.querySelectorAll("hr"),t;localStorage.wmpotifyDebugMode?t=n.querySelectorAll(".contextMenuItem:not([data-hidden])"):t=n.querySelectorAll(".contextMenuItem:not([data-hidden]):not(.debug)");let a=t[0].offsetHeight,o=0;if(e.length>0){let d=getComputedStyle(e[0]);o=e[0].offsetHeight+parseFloat(d.marginTop)+parseFloat(d.marginBottom)}return parseInt(t.length*a+e.length*o)}};function O(r,i,n){let e=document.createElement("div");return e.id=r+"MenuBg",e.className="contextMenuBg",e.tabIndex=-1,e.style.display="none",e.innerHTML=`<div id="${r}Menu" class="contextMenu"></div>`,n&&(e.dataset.submenuOf=n),i.forEach(t=>{if(t.hr){let o=document.createElement("hr");e.querySelector(".contextMenu").appendChild(o);return}let a=document.createElement("div");a.className="contextMenuItem",t.args?a.innerHTML="<p>"+oe(t.text,...t.args)+"</p>":a.innerHTML="<p>"+oe(t.text)+"</p>",t.classList&&a.classList.add(...t.classList),t.disabled&&a.classList.add("disabled"),t.hidden&&(a.dataset.hidden=!0),t.submenu&&(a.dataset.submenu=t.submenu,a.innerHTML+='<p class="submenuMark">\u23F5</p>'),t.noClose&&(a.dataset.noClose=!0),a.addEventListener("click",t.click),e.querySelector(".contextMenu").appendChild(a)}),document.body.appendChild(e),{menuBg:e,menu:e.querySelector(".contextMenu"),menuItems:e.querySelectorAll(".contextMenuItem")}}function V(r,i=getComputedStyle(document.documentElement).getPropertyValue("--menu-font")){let e=(V.canvas||(V.canvas=document.createElement("canvas"))).getContext("2d");return e.font=i,e.measureText(r).width}function oe(r){if(r=r.replace(/&([^&])/g,"<u>$1</u>").replace(/\\&/g,"&"),arguments.length>1)for(let i=1;i<arguments.length;i++)r=r.replace(/%s/,arguments[i]),r=r.replace(`%${i}s`,arguments[i]);return r}var _=1;function re(r){_=r||1}function se(){let r=t=>{t&&(t._updateUiClient?.updateTitlebarHeight&&t._updateUiClient.updateTitlebarHeight({height:_}),t._updateUiClient?.setButtonsVisibility&&_<=1&&t._updateUiClient.setButtonsVisibility(!1),window.addEventListener("beforeunload",()=>{t._updateUiClient?.setButtonsVisibility&&t._updateUiClient.setButtonsVisibility({showButtons:!0})})),Spicetify.CosmosAsync.post("sp://messages/v1/container/control",{type:"update_titlebar",height:_+"px"})};r(Spicetify.Platform.ControlMessageAPI),r(Spicetify.Platform.UpdateAPI);async function i(){r(Spicetify.Platform.ControlMessageAPI),r(Spicetify.Platform.UpdateAPI)}let n=setInterval(i,100);setTimeout(()=>{clearInterval(n)},1e4);let e=()=>{r(Spicetify.Platform.ControlMessageAPI),r(Spicetify.Platform.UpdateAPI)};document.addEventListener("fullscreenchange",e),window.addEventListener("resize",()=>{setTimeout(()=>{e()},100)})}var I=ControlManager={init:se,setControlHeight:re};function H(r,i){let n=Math.floor(r/1e3),e=Math.floor(n/60);if(n=String(n%60).padStart(2,"0"),e<60)return i&&(e=String(e).padStart(2,"0")),`${e}:${n}`;let t=Math.floor(e/60);return e=String(e%60).padStart(2,"0"),i&&(t=String(t).padStart(2,"0")),`${t}:${e}:${n}`}function K(){if(!document.querySelector("#queue-panel")||document.querySelector("#wmpotify-queue-toolbar")||document.querySelectorAll('div[data-encore-id="tabPanel"]').length>2)return;let r=document.querySelector("#Desktop_PanelContainer_Id"),i=document.querySelector("#Desktop_PanelContainer_Id > div > div:first-child > div:first-child"),n=document.querySelector("#Desktop_PanelContainer_Id > div > div:nth-child(2)"),e=document.createElement("div");e.id="wmpotify-queue-toolbar";let t=document.createElement("button");t.id="wmpotify-queue-playlist-button",t.classList.add("wmpotify-toolbar-button"),t.addEventListener("click",()=>{window.open(Spicetify.Player.data.context.uri)}),t.textContent=document.querySelector('#queue-panel div[data-flip-id*="section-header-"] a')?.textContent||"Now Playing",t.innerHTML+='<span class="expandMark">\u23F7</span>',e.appendChild(t);let a=document.createElement("button");a.id="wmpotify-queue-clear-button",a.classList.add("wmpotify-toolbar-button"),a.addEventListener("click",()=>{Spicetify.Platform.PlayerAPI.clearQueue(),Spicetify.Player.playUri("")}),e.appendChild(a),n.insertAdjacentElement("afterbegin",e);let o=document.createElement("div");o.id="wmpotify-queue-npv";let u=document.createElement("img");u.id="wmpotify-queue-album-art",u.src=document.querySelector(".main-nowPlayingWidget-coverArt .cover-art img")?.src||"",o.appendChild(u);let d=document.createElement("div");d.id="wmpotify-queue-song-title",d.textContent=document.querySelector(".main-trackInfo-name")?.textContent||"",o.appendChild(d),i.insertAdjacentElement("afterbegin",o),W(),new MutationObserver(W).observe(document.querySelectorAll("#queue-panel ul")[1],{childList:!0}),new MutationObserver(()=>{let g=document.querySelectorAll("#queue-panel ul")[1];g&&(W(),new MutationObserver(W).observe(g,{childList:!0}))}).observe(document.querySelector("#queue-panel"),{childList:!0});let s=document.querySelectorAll('#Desktop_PanelContainer_Id div[role="tablist"] button'),h=[],m;for(let g of s)h.push({text:g.textContent,click:function(){for(let w of m.menuItems)w.classList.remove("activeStyle");this.classList.add("activeStyle"),g.click()}});h[0].classList=["activeStyle"],document.querySelector("#wmpotifyQueueTabMenuBg")?.remove(),m=O("wmpotifyQueueTab",h);let b=new x(["wmpotifyQueueTab"]);r.addEventListener("contextmenu",g=>{g.preventDefault(),b.openMenu("wmpotifyQueueTab",{left:g.clientX+"px",top:g.clientY+"px"})}),Spicetify.Player.addEventListener("songchange",()=>{t.textContent=Spicetify.Player.data?.context?.metadata?.context_description||"Now Playing",t.innerHTML+='<span class="expandMark">\u23F7</span>',u.src=Spicetify.Player.data?.item?.album?.images?.[0]?.url?.replace("spotify:image:","https://i.scdn.co/image/")||"",d.textContent=Spicetify.Player.data?.item?.name||""})}function W(){if(!document.querySelector("#queue-panel")||!Spicetify.Queue)return;let r=document.querySelectorAll("#queue-panel li .HeaderArea");for(let i=0;i<r.length;i++){let n=r[i];if(n.querySelector(".wmpotify-queue-duration"))continue;let e=i===0?Spicetify.Queue.track?.contextTrack?.metadata?.duration:Spicetify.Queue.nextTracks?.[i-1]?.contextTrack?.metadata?.duration;if(!e)continue;let t=document.createElement("span");t.classList.add("wmpotify-queue-duration"),t.textContent=H(e),n.appendChild(t)}}var y=document.createElement("div");function ue(){if(document.getElementById("wmpotify-config"))return;let r=document.querySelector(".Root__main-view");y.id="wmpotify-config",y.innerHTML=`
        <div id="wmpotify-config-topborder"></div>
        <p id="wmpotify-config-title">WMPotify Properties (WIP)</p>
        <button id="wmpotify-config-close"></button>
        <label for="wmpotify-config-style">Style</label>
        <select id="wmpotify-config-style">
            <option value="xp">XP</option>
            <option value="aero">Aero</option>
            <option value="basic">Basic</option>
        </select><br>
        <label for="wmpotify-config-title-style">Title style</label>
        <select id="wmpotify-config-title-style">
            <option value="auto">Auto</option>
            <option value="native">Native</option>
            <option value="custom">Custom</option>
            <option value="spotify">Spotify</option>
            <option value="keepmenu">Keep Menu</option>
        </select><br>
        <label for="wmpotify-config-show-libx">Show Your Library X on the left sidebar</label>
        <input type="checkbox" id="wmpotify-config-show-libx"><br>
        <button id="wmpotify-config-apply">Apply</button><br>
        <span style="color: lightgray;">WMPotify for Spicetify by Ingan121</span><br>
        <a href="https://github.com/Ingan121/WMPotify" target="_blank">GitHub</a>
    `,y.querySelector("#wmpotify-config-close").addEventListener("click",ie),y.querySelector("#wmpotify-config-apply").addEventListener("click",ae),localStorage.wmpotifyStyle&&(y.querySelector("#wmpotify-config-style").value=localStorage.wmpotifyStyle);let i=y.querySelector("#wmpotify-config-title-style");navigator.userAgent.includes("Windows")||i.querySelector("option[value=keepmenu]").remove(),navigator.userAgent.includes("Linux")&&i.querySelector("option[value=spotify]").remove(),localStorage.wmpotifyTitleStyle&&(i.value=localStorage.wmpotifyTitleStyle),localStorage.wmpotifyShowLibX&&(y.querySelector("#wmpotify-config-show-libx").checked=!0),r.appendChild(y)}function ce(){y.style.display="block"}function ie(){y.style.display="none"}function ae(){let r=y.querySelector("#wmpotify-config-style").value,i=y.querySelector("#wmpotify-config-title-style").value,n=y.querySelector("#wmpotify-config-show-libx").checked;localStorage.wmpotifyStyle=r,i!=="auto"?localStorage.wmpotifyTitleStyle=i:delete localStorage.wmpotifyTitleStyle,n?localStorage.wmpotifyShowLibX=!0:delete localStorage.wmpotifyShowLibX,location.reload()}var j=Config={init:ue,open:ce,close:ie,apply:ae};(function(){let r=[".Root__globalNav",".main-globalNav-historyButtons",".main-globalNav-searchSection",".main-globalNav-searchContainer > button",".main-globalNav-searchContainer div form button",".main-topBar-searchBar",'.custom-navlinks-scrollable_container div[role="presentation"] > button',".main-topBar-topbarContentRight > .main-actionButtons > button",".main-topBar-topbarContentRight > button:last-child",".Root__main-view",".player-controls__left",'.player-controls__buttons button[data-testid="control-button-skip-back"]','.player-controls__buttons button[data-testid="control-button-repeat"]','.player-controls__buttons button[data-testid="control-button-playpause"]',".player-controls__right",".playback-bar .encore-text",".volume-bar",".volume-bar__icon-button",".volume-bar .progress-bar",".main-nowPlayingBar-left",".main-nowPlayingWidget-trackInfo",".Root__right-sidebar div[class]"],i={"Your Library":"Library","Friend Activity":"Friends"};async function n(){switch(localStorage.wmpotifyShowLibX||(document.body.dataset.hideLibx=!0),localStorage.wmpotifyStyle){case"xp":case"aero":break;case void 0:localStorage.wmpotifyStyle="xp";break;case"basic":document.hasFocus()?document.body.style.backgroundColor="var(--active-title)":document.body.style.backgroundColor="var(--inactive-title)",window.addEventListener("focus",()=>{document.body.style.backgroundColor="var(--active-title)"}),window.addEventListener("blur",()=>{document.body.style.backgroundColor="var(--inactive-title)"});break;default:document.body.style.backgroundColor=localStorage.wmpotifyStyle}document.documentElement.dataset.wmpotifyStyle=localStorage.wmpotifyStyle||"xp";let t="spotify";switch(localStorage.wmpotifyTitleStyle&&["native","custom","spotify","keepmenu"].includes(localStorage.wmpotifyTitleStyle)?t=localStorage.wmpotifyTitleStyle:window.outerHeight-window.innerHeight>0?t="native":window.SpotEx&&(t="custom"),t==="keepmenu"&&!navigator.userAgent.includes("Windows")&&(t="spotify"),t==="spotify"&&navigator.userAgent.includes("Linux")&&(t="native"),document.documentElement.dataset.wmpotifyTitleStyle=t,t){case"native":I.setControlHeight(0);break;case"custom":I.setControlHeight(0);case"keepmenu":let l=document.createElement("div");if(l.id="wmpotify-title-buttons",window.SpotEx){let C=document.createElement("button");C.id="wmpotify-minimize-button",C.addEventListener("click",()=>{SpotEx.updateWindow({state:"minimized"})}),l.appendChild(C);let E=document.createElement("button");E.id="wmpotify-maximize-button",E.addEventListener("click",async()=>{(await SpotEx.getWindow()).state==="maximized"?SpotEx.updateWindow({state:"normal"}):SpotEx.updateWindow({state:"maximized"})}),l.appendChild(E),window.addEventListener("resize",async()=>{(await SpotEx.getWindow()).state==="maximized"?E.dataset.maximized=!0:delete E.dataset.maximized})}let c=document.createElement("button");c.id="wmpotify-close-button",c.addEventListener("click",()=>{window.close()}),l.appendChild(c);case"spotify":let p=document.createElement("div");p.id="wmpotify-title-bar";let f=document.createElement("div");f.id="wmpotify-title-icon",f.addEventListener("dblclick",()=>{window.close()}),p.appendChild(f);let A=document.createElement("span");A.id="wmpotify-title-text",A.textContent=await Spicetify.AppTitle.get(),p.appendChild(A),(t==="custom"||t==="keepmenu")&&p.appendChild(l),(t==="keepmenu"||t==="spotify")&&I.setControlHeight(25),document.body.appendChild(p),Spicetify.AppTitle.sub(C=>{A.textContent=C});break}I.init();let a=document.querySelector(".Root__globalNav"),o=document.createElement("div");o.id="wmpotify-tabs-container",a.insertBefore(o,a.querySelector(".main-globalNav-searchSection"));let u=document.querySelector(".main-globalNav-searchContainer > button");T(u);let d=document.querySelector(".main-globalNav-searchContainer div form button");T(d);let s=[u,d],h=document.querySelectorAll('.custom-navlinks-scrollable_container div[role="presentation"] > button');for(let l of h)T(l),s.push(l);let m=document.querySelectorAll(".main-topBar-topbarContentRight > .main-actionButtons > button");for(let l of m)T(l),s.push(l);let b=[];for(let l of s)b.push({text:l.querySelector(".wmpotify-tab-label").textContent,click:()=>l.click()});O("wmpotifyTab",b);let g=new x(["wmpotifyTab"]),w=document.createElement("button");w.id="wmpotify-tabs-overflow-button",w.addEventListener("click",()=>{g.openMenu("wmpotifyTab",{top:"0",left:w.getBoundingClientRect().left+"px"})}),o.appendChild(w),P(),setTimeout(P,1e3),window.addEventListener("resize",P);let Y=document.querySelector(".main-topBar-topbarContentRight > button:last-child"),N=document.createElement("span");N.textContent=Y.getAttribute("aria-label"),N.classList.add("wmpotify-user-label"),Y.appendChild(N);let R=document.createElement("div");R.id="wmpotify-search-container";let q=document.createElement("div");q.id="wmpotify-search-wrapper";let z=document.querySelector(".main-topBar-searchBar");q.appendChild(z);let k=document.createElement("button");k.id="wmpotify-search-clear-button",k.setAttribute("aria-label","Clear search"),k.addEventListener("click",()=>{z.value="",z.focus(),window.open("spotify:search")}),q.appendChild(k),R.appendChild(q),a.appendChild(R),j.init(),new Spicetify.Menu.Item("WMPotify Properties",!1,j.open).register();let Q=document.querySelector(".player-controls__buttons button[data-testid='control-button-playpause']");Spicetify.Player.addEventListener("onplaypause",X),new MutationObserver(X).observe(Q,{attributes:!0,attributeFilter:["aria-label"]}),ee(),new MutationObserver(ee).observe(document.querySelector(".main-nowPlayingBar-left"),{childList:!0});let v=document.querySelector(".player-controls__left"),G=document.querySelector('.player-controls__buttons button[data-testid="control-button-skip-back"]'),J=document.querySelector('.player-controls__buttons button[data-testid="control-button-repeat"]');v.insertBefore(J,G);let B=document.createElement("button");B.setAttribute("aria-label","Stop"),B.id="wmpotify-stop-button",B.addEventListener("click",()=>{Spicetify.Platform.PlayerAPI.clearQueue(),Spicetify.Player.playUri("")}),v.insertBefore(B,G);let le=document.querySelector(".player-controls__right"),U=document.querySelector(".volume-bar"),L=U.querySelector(".volume-bar__icon-button"),Z=U.querySelector(".progress-bar");te(),new MutationObserver(te).observe(Z,{attributes:!0,attributeFilter:["style"]}),le.appendChild(U);let D=document.querySelectorAll(".playback-bar .encore-text"),$=document.createElement("div");$.classList.add("wmpotify-time-text-container");let S=document.createElement("span");S.classList.add("wmpotify-time-text");let M=parseInt(localStorage.wmpotifyTimeTextMode||0);ne(),S.dataset.mode=M,S.addEventListener("click",()=>{M=(M+1)%3,S.dataset.mode=M,localStorage.wmpotifyTimeTextMode=M}),$.appendChild(S),v.insertAdjacentElement("afterbegin",$),Spicetify.Player.addEventListener("onprogress",ne);let F=new MutationObserver(()=>{let l=v.children.length;l!==4&&(F.disconnect(),v.insertBefore(v.children[l-2],J),F.observe(v,{childList:!0}))});F.observe(v,{childList:!0}),K(),new MutationObserver(K).observe(document.querySelector(".Root__right-sidebar div[class]"),{childList:!0});function T(l){o.appendChild(l);let c=document.createElement("span"),p=l.getAttribute("aria-label");c.textContent=i[p]||p,c.classList.add("wmpotify-tab-label"),l.appendChild(c)}function P(){let l=document.querySelector(".main-globalNav-historyButtons").getBoundingClientRect().right,c=window.innerWidth-document.querySelector(".main-topBar-topbarContentRight").getBoundingClientRect().left,p=160,f=0;for(;window.innerWidth-l-c-p<o.getBoundingClientRect().width&&f<s.length;)s[s.length-1-f++].dataset.hidden=!0;for(f=document.querySelectorAll("#wmpotify-tabs-container button[data-hidden]").length;f>0&&window.innerWidth-l-c-p>o.getBoundingClientRect().width;)delete s[s.length-f--].dataset.hidden;w.style.display=f>0?"block":""}globalThis.handleTabOverflow=P;function ee(){X();let l=document.querySelector(".main-nowPlayingWidget-trackInfo");if(!l||document.querySelector(".wmpotify-track-info"))return;let c=document.createElement("p");c.classList.add("wmpotify-track-info"),c.textContent=document.querySelector(".main-trackInfo-name")?.textContent||"",l.appendChild(c);let p=1;setInterval(()=>{if(!Spicetify.Player.isPlaying())return;let f=Spicetify.Player.data?.item.metadata;f&&(p===0?c.textContent=f.title:p===1?c.textContent=f.artist_name:p===2&&(c.textContent=f.album_title),p=(p+1)%3)},3e3),Spicetify.Player.addEventListener("songchange",()=>{p=0,c.textContent=Spicetify.Player.data?.item.metadata.title})}function X(){Spicetify.Player.isPlaying()?Q.classList.add("playing"):Q.classList.remove("playing")}function te(){let l=getComputedStyle(Z).getPropertyValue("--progress-bar-transform").replace("%","")/100;l===0?L.dataset.vol="muted":l<=.3?L.dataset.vol="low":l<=.6?L.dataset.vol="mid":L.dataset.vol="high"}function ne(){switch(M){case 0:{let l=Spicetify.Player.data.item.metadata.duration-Spicetify.Player.getProgress();S.textContent=H(l,!0)}break;case 1:{let l=D[0].textContent;(l.length===4||l.length===7)&&(l="0"+l),S.textContent=l}break;case 2:{let l=D[0].textContent;(l.length===4||l.length===7)&&(l="0"+l);let c=D[1].textContent;(c.length===4||c.length===7)&&(c="0"+c),S.textContent=`${l} / ${c}`}break}}}function e(){return window.Spicetify&&window.Spicetify.CosmosAsync&&window.Spicetify.Platform?.PlayerAPI&&window.Spicetify.AppTitle&&window.Spicetify.Player?.origin?._state&&window.Spicetify.Menu&&r.every(t=>document.querySelector(t))}window.addEventListener("load",()=>{let t=0,a=setInterval(()=>{if(e())n(),console.log("WMPotify: Theme loaded"),clearInterval(a);else if(t++>100){alert("[WMPotify] Theme loading failed. Please refresh the page to try again. Please make sure you have compatible Spoitfy version and have global navbar enabled."),clearInterval(a);let o=[];for(let u of r)document.querySelector(u)||o.push(u);console.log("WMPotify: Missing elements:",o)}},100)})})();})();
