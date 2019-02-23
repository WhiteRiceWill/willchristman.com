import React, { Component } from 'react';
import styles from './EnterBtn.module.css';

class EnterBtn extends Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: true,
    };

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    e.preventDefault();
    const { visible } = this.state;
    const { enterClick } = this.props;

    if (visible) {
      this.setState({
        visible: false,
      });
      // Callback to parent because Redux felt like overkill.
      // If I end up adding more state migrate over.
      enterClick();
    }
  }

  render() {
    const { visible } = this.state;

    return (
      <div className={visible ? styles.boxVisible : styles.boxHidden} onClick={this.handleClick}>
        <div className={styles.text}>
          ENTER
        </div>
      </div>
    );
  }
}


export default EnterBtn;
