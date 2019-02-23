import React, { Component } from 'react';
import styles from './NotFound.module.css';

class NotFound extends Component {
  render() {
    return (
      <div className={styles.box}>
        <div className={styles.text1}>
          404
        </div>
        <div className={styles.text2}>
          PAGE NOT FOUND
        </div>
      </div>
    );
  }
}

export default NotFound;
