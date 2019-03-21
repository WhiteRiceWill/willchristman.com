import React, { Component } from 'react';
import { Route, Router, Switch } from 'react-router-dom';
import { history } from '../../configureStore';
import styles from './App.module.css';
import Home from '../Home/Container';
import NotFound from '../NotFound/Component';

const pathToBackgrounds = require.context('../../assets/backgrounds', true);

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      background: 0,
    };

    this.toggleBackground = this.toggleBackground.bind(this);
  }

  componentDidMount() {
    document.addEventListener('keypress', this.toggleBackground);
  }

  componentWillUnmount() {
    document.removeEventListener('keypress', this.toggleBackground);
  }

  // Rotate through background images
  toggleBackground(e) {
    if (e.key === 't') {
      const { background } = this.state;
      if (background === 4) {
        this.setState({
          background: 0,
        });
      } else {
        this.setState({
          background: background + 1,
        });
      }
    }
  }

  render() {
    const { background } = this.state;
    const backgroundImg = pathToBackgrounds(`./${background}.jpg`, true);
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        backgroundImage: `url(${backgroundImg}`,
        backgroundSize: 'cover',
      }}
      >
        <Router history={history}>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/resume" component={Home} />
            <Route component={NotFound} />
          </Switch>
        </Router>
      </div>
    );
  }
}

export default App;
