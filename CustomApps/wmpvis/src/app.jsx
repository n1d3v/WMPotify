'use strict';

import React from 'react'
import { init, updateVisConfig, uninit } from './wmpvis';
import ButterchurnAdaptor from './butterchurn/adaptor';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.props = props;
    this.elemRefs = {
      root: React.createRef(),
      albumArt: React.createRef(),
      visBar: React.createRef(),
      visTop: React.createRef(),
      visBC: React.createRef(),
      debug: React.createRef(),
      lyrics: React.createRef()
    };
    this.state = {
      type: localStorage.wmpotifyVisType || "bars",
      bcPreset: localStorage.wmpotifyVisBCPreset || "Random",
      showLyrics: !!localStorage.wmpotifyVisShowLyrics,
      isFullscreen: !!document.fullscreenElement
    };
  }

  componentDidMount() {
    init(this.elemRefs);
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        init(this.elemRefs);
        observer.disconnect();
      }
    });

    observer.observe(this.elemRefs.visBar.current);
    document.addEventListener('fullscreenchange', this.handleFullscreenChange);
  }

  componentWillUnmount() {
    uninit();
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
  }

  changeVisType = (type) => {
    localStorage.wmpotifyVisType = type;
    updateVisConfig();
    this.setState({
      type: type
    });
  };

  handleFullscreenChange = () => {
    this.setState({ isFullscreen: !!document.fullscreenElement });
  };

  render() {
    const bcPresets = ButterchurnAdaptor.getPresets();

    const SvgIcon = React.memo((props) => {
      return <svg class={props.class} height="16" width="16" viewBox="0 0 16 16" fill="currentColor"><path d={props.d}></path></svg>;
    });

    const CheckMark = React.memo((props) => {
      return <SvgIcon class={props.class} d="M15.53 2.47a.75.75 0 0 1 0 1.06L4.907 14.153.47 9.716a.75.75 0 0 1 1.06-1.06l3.377 3.376L14.47 2.47a.75.75 0 0 1 1.06 0z"></SvgIcon>;
    });

    const ActiveRadio = React.memo(() => {
      return <CheckMark class="activeStyle" />;
    });

    const MenuWrapper = React.memo(() => {
      return <Spicetify.ReactComponent.Menu>
        <Spicetify.ReactComponent.MenuItem
          label="Track Info"
          onClick={() => window.open(Spicetify.Player.data?.item?.uri)}
          divider="after"
        >
          Info Center View: Spotify
        </Spicetify.ReactComponent.MenuItem>
        <Spicetify.ReactComponent.MenuItem
          label="No Visualization"
          onClick={() => this.changeVisType("none")}
          divider="after"
          leadingIcon={this.state.type === "none" ? <ActiveRadio /> : null}
        >
          No Visualization
        </Spicetify.ReactComponent.MenuItem>
        <Spicetify.ReactComponent.MenuItem
          label="Album Art"
          onClick={() => this.changeVisType("albumArt")}
          leadingIcon={this.state.type === "albumArt" ? <ActiveRadio /> : null}
        >
          Album Art
        </Spicetify.ReactComponent.MenuItem>
        <Spicetify.ReactComponent.MenuItem
          label="Bars"
          onClick={() => this.changeVisType("bars")}
          leadingIcon={this.state.type === "bars" ? <ActiveRadio /> : null}
        >
          Bars
        </Spicetify.ReactComponent.MenuItem>
        <Spicetify.ReactComponent.MenuSubMenuItem
          displayText="MilkDrop"
          label="MilkDrop"
          divider="after"
          leadingIcon={this.state.type === "milkdrop" ? <ActiveRadio /> : null}
        >
          <Spicetify.ReactComponent.MenuItem
            label="Random"
            onClick={() => {
              this.changeVisType("milkdrop");
              ButterchurnAdaptor.setPreset(null);
              delete localStorage.wmpotifyVisBCPreset;
              this.setState({ bcPreset: "Random" });
            }}
            leadingIcon={this.state.bcPreset === "Random" ? <ActiveRadio /> : null}
          >
            Random
          </Spicetify.ReactComponent.MenuItem>
          {bcPresets.map((preset) => (
            <Spicetify.ReactComponent.MenuItem
              key={preset}
              label={preset}
              onClick={() => {
                this.changeVisType("milkdrop");
                ButterchurnAdaptor.setPreset(preset);
                localStorage.wmpotifyVisBCPreset = preset;
                this.setState({ bcPreset: preset });
              }}
              leadingIcon={this.state.bcPreset === preset ? <ActiveRadio /> : null}
            >
              {preset}
            </Spicetify.ReactComponent.MenuItem>
          ))}
        </Spicetify.ReactComponent.MenuSubMenuItem>
        <Spicetify.ReactComponent.MenuSubMenuItem
          displayText="Lyrics"
          label="Lyrics"
          divider="after"
        >
          <Spicetify.ReactComponent.MenuItem
            label="Show Lyrics"
            onClick={() => {
              if (this.state.showLyrics) {
                delete localStorage.wmpotifyVisShowLyrics;
              } else {
                localStorage.wmpotifyVisShowLyrics = "true";
              }
              this.setState({ showLyrics: !this.state.showLyrics });
            }}
            divider="after"
            leadingIcon={this.state.showLyrics ? <CheckMark /> : null}
          >
            Show Lyrics
          </Spicetify.ReactComponent.MenuItem>
          <Spicetify.ReactComponent.MenuItem
            label="Use Spotify Lyrics"
            onClick={() => Spicetify.showNotification('Hello World')}
            divider="after"
          >
            Use Spotify Lyrics
          </Spicetify.ReactComponent.MenuItem>
          <Spicetify.ReactComponent.MenuItem
            label="Load Lyrics"
            onClick={() => Spicetify.showNotification('Hello World')}
          >
            Load Lyrics
          </Spicetify.ReactComponent.MenuItem>
          <Spicetify.ReactComponent.MenuItem
            label="Search Lyrics"
            onClick={() => Spicetify.showNotification('Hello World')}
          >
            Search Lyrics
          </Spicetify.ReactComponent.MenuItem>
          <Spicetify.ReactComponent.MenuItem
            label="Open Lyrics File"
            onClick={() => Spicetify.showNotification('Hello World')}
          >
            Open Lyrics File
          </Spicetify.ReactComponent.MenuItem>
        </Spicetify.ReactComponent.MenuSubMenuItem>
        <Spicetify.ReactComponent.MenuItem
          label="Full Screen"
          onClick={() => document.querySelector('.main-nowPlayingBar-extraControls button[data-testid="fullscreen-mode-button"]')?.click()}
          leadingIcon={this.state.isFullscreen ? <CheckMark /> : null}
        >
          Full Screen
        </Spicetify.ReactComponent.MenuItem>
      </Spicetify.ReactComponent.Menu>
    });

    return <>
      <Spicetify.ReactComponent.ContextMenu
        trigger="right-click"
        menu={<MenuWrapper />}
      >
        <section
          className="contentSpacing"
          style={{
            position: "absolute",
            height: "100%",
            backgroundColor: this.state.type === "albumArt" ? "var(--spice-main)" : "black",
          }}
          ref={this.elemRefs.root}
        >
          <img className="wmpvis-albumArt"
            style={{
              display: this.state.type === "albumArt" ? "block" : "none",
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              boxShadow: "var(--album-shadow-big)",
              zIndex: 0
            }}
            ref={this.elemRefs.albumArt}
          />
          <canvas
            className="wmpvis-visBar"
            style={{
              display: this.state.type === "bars" ? "block" : "none",
              width: "100%",
              height: "100%",
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 2
            }}
            ref={this.elemRefs.visBar}
          ></canvas>
          <canvas
            className="wmpvis-visTop"
            style={{
              display: this.state.type === "bars" ? "block" : "none",
              width: "100%",
              height: "100%",
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 1
            }}
            ref={this.elemRefs.visTop}
          ></canvas>
          <canvas
            className="wmpvis-visBC"
            style={{
              display: this.state.type === "milkdrop" ? "block" : "none",
              width: "100%",
              height: "100%",
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 3
            }}
            ref={this.elemRefs.visBC}
          ></canvas>
          <p
            className="wmpvis-debug"
            style={{ position: "absolute", top: 0, left: 0, zIndex: 3 }}
            ref={this.elemRefs.debug}
          ></p>
          <div
            className="wmpvis-lyrics"
            style={{
              display: this.state.showLyrics ? "block" : "none",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              color: "white",
              width: "100%",
              height: "100%",
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 4
            }}
            ref={this.elemRefs.lyrics}
          ></div>
        </section>
      </Spicetify.ReactComponent.ContextMenu>
    </>
  } 
}

export default App;
