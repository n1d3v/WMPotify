'use strict';

import React from 'react'
import { init } from './wmpvis';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.props = props;
    this.elemRefs = {
      root: React.createRef(),
      albumArt: React.createRef(),
      visBar: React.createRef(),
      visTop: React.createRef(),
      debug: React.createRef(),
    };
  }

  componentDidMount() {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        init(this.elemRefs);
        observer.disconnect();
      }
    });

    observer.observe(this.elemRefs.visBar.current);
  }

  render() {
    return <>
      <Spicetify.ReactComponent.ContextMenu
        trigger="right-click"
        menu={
          <Spicetify.ReactComponent.Menu>
            <Spicetify.ReactComponent.MenuItem
              label="Track Info"
              onClick={() => window.open(Spicetify.Player.data.item.uri)}
              divider="after"
            >
              Info Center View: Spotify
            </Spicetify.ReactComponent.MenuItem>
            <Spicetify.ReactComponent.MenuItem
              label="No Visualization"
              onClick={() => Spicetify.showNotification('Hello World')}
              divider="after"
            >
              No Visualization
            </Spicetify.ReactComponent.MenuItem>
            <Spicetify.ReactComponent.MenuItem
              label="Album Art"
              onClick={() => Spicetify.showNotification('Hello World')}
            >
              Album Art
            </Spicetify.ReactComponent.MenuItem>
            <Spicetify.ReactComponent.MenuItem
              label="Bars"
              divider="after"
              onClick={() => Spicetify.showNotification('Hello World')}
            >
              Bars
            </Spicetify.ReactComponent.MenuItem>
            <Spicetify.ReactComponent.MenuItem
              label="Lyrics"
              divider="after"
              onClick={() => Spicetify.showNotification('Hello World')}
            >
              Lyrics
            </Spicetify.ReactComponent.MenuItem>
            <Spicetify.ReactComponent.MenuItem
              label="Full Screen"
              onClick={() => Spicetify.showNotification('Hello World')}
            >
              Full Screen
            </Spicetify.ReactComponent.MenuItem>
          </Spicetify.ReactComponent.Menu>
        }
      >
        {/* <Spicetify.ReactComponent.ContextMenu
          renderInline={true}
          action="toggle"
          menu={
            <Spicetify.ReactComponent.Menu>
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
                divider="after"
                onClick={() => Spicetify.showNotification('Hello World')}
              >
                Open Lyrics File
              </Spicetify.ReactComponent.MenuItem>
            </Spicetify.ReactComponent.Menu>
          }
        ></Spicetify.ReactComponent.ContextMenu> */}
            
        <section className="contentSpacing" ref={this.elemRefs.root}>
          <img className="wmpvis-albumArt"
            style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 0 }}
            ref={this.elemRefs.albumArt}
          />
          <canvas
            className="wmpvis-visBar"
            style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0, zIndex: 2 }}
            ref={this.elemRefs.visBar}
          ></canvas>
          <canvas
            className="wmpvis-visTop"
            style={{ width: "100%", height: "100%", position: "absolute", backgroundColor: "black", top: 0, left: 0, zIndex: 1 }}
            ref={this.elemRefs.visTop}
          ></canvas>
          <p
            className="wmpvis-debug"
            style={{ position: "absolute", top: 0, left: 0, zIndex: 3 }}
            ref={this.elemRefs.debug}
          ></p>
        </section>
      </Spicetify.ReactComponent.ContextMenu>
    </>
  } 
}

export default App;
