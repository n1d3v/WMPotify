'use strict';

import React from 'react'
import { init } from './wmpvis';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.elemRefs = {
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
      <section className="contentSpacing">
        <canvas className="wmpvis-visBar" style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0, zIndex: 2 }} ref={this.elemRefs.visBar}></canvas>
        <canvas className="wmpvis-visTop" style={{ width: "100%", height: "100%", position: "absolute", backgroundColor: "black", top: 0, left: 0, zIndex: 1 }} ref={this.elemRefs.visTop}></canvas>
        <p className="wmpvis-debug" style={{ position: "absolute", top: 0, left: 0, zIndex: 3 }} ref={this.elemRefs.debug}></p>
      </section>
    </>
  } 
}

export default App;
