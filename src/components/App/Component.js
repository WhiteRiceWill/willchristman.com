import React, { Component } from 'react';
import { Route, Router, Switch } from 'react-router-dom';
import { history } from '../../configureStore';
import styles from './App.module.css';
import Home from '../Home/Container';
import NotFound from '../NotFound/Component';
import background from '../../assets/background.jpg';

class App extends Component {
  render() {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        backgroundImage: `url(${background}`,
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
