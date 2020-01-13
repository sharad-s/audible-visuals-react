import React, { Component } from 'react';
import './App.css';

import Spiral from './components/Spiral';
import Flower from './components/Flower';

export default class App extends Component {
  render() {
    return (
      <div className="god">
        <Spiral />
      </div>
    );
  }
}
