import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import * as d3 from 'd3';
import { forceBounce } from 'd3-force-bounce/src';
import { forceSurface } from 'd3-force-surface/src';
import { isMobile } from 'react-device-detect';
import EnterBtn from '../EnterBtn/Component';
import styles from './Home.module.css';
import nodes from '../../nodes.json';

const pathToImgs = require.context('../../assets', true);

class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: false,
    };


    // Set smaller node radius on mobile devices
    this.regR = 60;
    this.mobileR = 46;

    if (isMobile) {
      this.r = this.mobileR;
    } else {
      this.r = this.regR;
    }

    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.mouseX = null;
    this.mouseY = null;
    // Pulls this node data from the json file
    this.nodes = nodes;

    this.getMouse = this.getMouse.bind(this);
    this.tickActions = this.tickActions.bind(this);
    this.createForce = this.createForce.bind(this);
    this.initializeNodes = this.initializeNodes.bind(this);
    this.initializeWindowResize = this.initializeWindowResize.bind(this);
    this.createDefs = this.createDefs.bind(this);
    this.createLinkNodes = this.createLinkNodes.bind(this);
    this.createMeNode = this.createMeNode.bind(this);
    this.createTooltip = this.createTooltip.bind(this);
    this.makeGradient = this.makeGradient.bind(this);
    this.enterClick = this.enterClick.bind(this);
  }

  componentDidMount() {
    // Set up d3 force simulation and start
    this.d3Graph = d3.select(ReactDOM.findDOMNode(this.refs.graph));
    this.d3Graph.on('mousemove', this.getMouse);
    this.force = this.createForce();
    this.force.on('tick', this.tickActions);

    // Run everything
    this.initializeNodes();
    this.initializeWindowResize();
    this.createDefs();
    this.createLinkNodes();
    this.createMeNode();
    this.createTooltip();
  }

  componentWillUnmount() {
    this.force.stop();
  }

  getMouse() {
    const coordinates = d3.mouse(this.refs.graph);
    [this.mouseX, this.mouseY] = [coordinates[0], coordinates[1]];
  }

  // This is called on every tick of the force simulation
  // and is responsible for the animation stepping forward.
  // (it makes the circles move)
  tickActions() {
    // Keeps my node static and centered
    this.meNode
      .attr('transform', (d) => {
        d.vx = 0;
        d.vy = 0;
        d.x = this.w / 2;
        d.y = this.h / 2;
        return `translate(${d.x}, ${d.y})`;
      });

    // Moves the link nodes forward
    this.linkNode
      .attr('transform', (d) => {
        // Basic pythagorean calculation to find distance from mouse to center of node
        const a = this.mouseX - d.x;
        const b = this.mouseY - d.y;
        const c = Math.sqrt(a * a + b * b);

        // If a node is frozen and the mouse is inside of it then don't move it
        if (d.frozen) {
          if (c <= d.r) {
            d.vx = 0;
            d.vy = 0;
          }
        }

        // Keeps nodes within the boudaries of the screen
        if (d.x > this.w - d.r) {
          d.x = this.w - d.r;
        }
        if (d.x < d.r) {
          d.x = d.r;
        }
        if (d.y > this.h - d.r) {
          d.y = this.h - d.r;
        }
        if (d.y < d.r) {
          d.y = d.r;
        }

        return `translate(${d.x}, ${d.y})`;
      });

    this.force.restart();
  }

  // Creates a d3 force simulation on the nodes. The force bounce
  // module is responsible for making collisions between nodes elastic.
  // This essentially means that during a collision, energy transfers
  // between nodes rather than canceling out. The force surface
  // module is responsible for elastic collisions with the edges
  // of the screen. This creates a closed system that conserves
  // energy (with the exception of when a link node collides with my node).
  createForce() {
    return (
      d3.forceSimulation()
        .alphaDecay(0)
        .velocityDecay(0)
        .nodes(this.nodes)
        .force('bounce', forceBounce()
          .radius(d => d.r)
          .elasticity(1)
          .onImpact((node1, node2) => {
            if (node1.frozen || node1.type === 'me') {
              node1.vx = 0;
              node1.vy = 0;
            }

            if (node2.frozen || node2.type === 'me') {
              node2.vx = 0;
              node2.vy = 0;
            }
          }))
        .force('container', forceSurface()
          .radius(d => d.r)
          .oneWay(true)
          .elasticity(1)
          .surfaces([
            { from: { x: 0, y: 0 }, to: { x: 0, y: this.h } },
            { from: { x: 0, y: this.h }, to: { x: this.w, y: this.h } },
            { from: { x: this.w, y: this.h }, to: { x: this.w, y: 0 } },
            { from: { x: this.w, y: 0 }, to: { x: 0, y: 0 } },
          ]))
    );
  }

  // Sets the initial placement and velocity of nodes
  initializeNodes() {
    this.nodes.forEach((node) => {
      if (node.type === 'me') {
        node.r = this.r;
        node.x = this.w / 2;
        node.y = this.h / 2;
        node.vx = 0;
        node.vy = 0;
      } else {
        node.r = this.r;
        node.x = (Math.random() * (this.w - 120)) + this.r;
        node.y = (Math.random() * (this.h - 120)) + this.r;
        node.vx = (Math.random() < 0.5 ? -1 : 1) * ((Math.random() * 0.4) + 0.1);
        node.vy = (Math.random() < 0.5 ? -1 : 1) * ((Math.random() * 0.4) + 0.1);
        // vxs and vys are for storing the velocity of a node prior to it being frozen
        // so that it can resume at that velocity when unfrozen.
        node.vxs = null;
        node.vys = null;
        node.frozen = false;
        // Scale width and height correctly (because mobile has smaller radius nodes)
        node.width *= (this.r / this.regR);
        node.height *= (this.r / this.regR);
      }
    });
  }

  // Handles changes to the force simulation on the event of a window resize
  initializeWindowResize() {
    d3.select(window).on('resize', () => {
      this.w = window.innerWidth;
      this.h = window.innerHeight;
      this.force.force('container', forceSurface()
        .radius(d => d.r)
        .elasticity(1)
        .oneWay(true)
        .surfaces([
          { from: { x: 0, y: 0 }, to: { x: 0, y: this.h } },
          { from: { x: 0, y: this.h }, to: { x: this.w, y: this.h } },
          { from: { x: this.w, y: this.h }, to: { x: this.w, y: 0 } },
          { from: { x: this.w, y: 0 }, to: { x: 0, y: 0 } },
        ]));
    });
  }

  // Function for generating the gradients on link nodes
  makeGradient(name, color1, color2, color3) {
    const gradient = this.defs.append('linearGradient')
      .attr('id', name)
      .attr('x1', '0%')
      .attr('x2', '100%')
      .attr('y1', '0%')
      .attr('y2', '100%');

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', color1);

    gradient.append('stop')
      .attr('offset', '50%')
      .attr('stop-color', color2);

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', color3);
  }

  // Create all gradients and drop shadows
  createDefs() {
    this.defs = this.d3Graph.append('defs');

    this.makeGradient('mail', '#FFD700', '#E5940F', '#C94911');
    this.makeGradient('pointypapers', '#EF9CA6', '#FD5C63', '#B70B28');
    this.makeGradient('cryptoladder', '#41C6E5', '#207CB8', '#003189');
    this.makeGradient('linkedin', '#0E8EC6', '#0077B5', '#00638E');
    this.makeGradient('twitter', '#40CAF4', '#07ABED', '#00A4D6');
    this.makeGradient('resume', '#80CE36', '#54C66F', '#09C694');
    this.makeGradient('github', '#232323', '#141414', '#000000');
    this.makeGradient('chatcircles', '#10FFE2', '#8488FF', '#FF24CB');

    const filter = this.defs.append('filter')
      .attr('id', 'dropShadow')
      .attr('height', '130%');

    filter.append('feGaussianBlur')
      .attr('in', 'SourceAlpha')
      .attr('stdDeviation', 3)
      .attr('result', 'blur');

    filter.append('feOffset')
      .attr('in', 'blur')
      .attr('dx', 1)
      .attr('dy', 1)
      .attr('result', 'offsetBlur');

    const feMerge = filter.append('feMerge');

    feMerge.append('feMergeNode')
      .attr('in', 'offsetBlur');

    feMerge.append('feMergeNode')
      .attr('in', 'SourceGraphic');
  }

  // Creates the first type of nodes which are link nodes.
  // These are the colorful moving circles that when clicked
  // take you to a link
  createLinkNodes() {
    const radius = this.r;

    this.linkNode = this.d3Graph.selectAll(null)
      .data(this.nodes.slice(0, 8))
      .enter()
      .append('g');

    this.linkNode
      .append('a')
      .on('click', function clickNode(d) {
        // Unfreeze the node and return to it's stored velocity
        d.frozen = false;
        d.vx = d.vxs;
        d.vy = d.vys;
        // Reset the circle and icon to their unfrozen state
        d.r = radius;
        d3.select(this.parentNode).select('.linkCircle')
          .transition()
          .duration(0)
          .attr('r', radius);

        d3.select(this.parentNode).select('.icon')
          .transition()
          .duration(0)
          .attr('width', z => z.width)
          .attr('height', z => z.height)
          .attr('x', z => -z.width / 2)
          .attr('y', z => -z.height / 2);
      })
      .attr('xlink:href', d => d.link)
      .attr('target', '_blank')
      .append('circle')
      .attr('class', 'linkCircle')
      .attr('r', radius)
      .attr('fill', d => `url(#${d.name})`)
      .on('mouseenter', function freeze(d) {
        // Freeze the node and enlarge it
        d.frozen = true;
        d.vxs = d.vx;
        d.vys = d.vy;
        d.r = radius * 1.085;
        d3.select(this)
          .transition()
          .duration(210)
          .attr('r', radius * 1.085);

        d3.select(this.parentNode.parentNode).select('.icon')
          .transition()
          .duration(210)
          .attr('width', z => z.width * 1.14)
          .attr('height', z => z.height * 1.14)
          .attr('x', z => (-z.width / 2) * 1.14)
          .attr('y', z => (-z.height / 2) * 1.14);
      })
      .on('mouseleave', function unFreeze(d) {
        if (d.frozen) {
          // Unfreeze the node and return to it's stored velocity
          d.frozen = false;
          d.vx = d.vxs;
          d.vy = d.vys;
          // Reset the circle and icon to their unfrozen state
          d.r = radius;
          d3.select(this)
            .transition()
            .duration(210)
            .attr('r', radius);

          d3.select(this.parentNode.parentNode).select('.icon')
            .transition()
            .duration(210)
            .attr('width', z => z.width)
            .attr('height', z => z.height)
            .attr('x', z => -z.width / 2)
            .attr('y', z => -z.height / 2);
        }
      });

    // Add an icon to the node
    this.linkNode.append('svg:image')
      .attr('class', 'icon')
      .attr('xlink:href', d => pathToImgs(`./${d.name}.svg`, true))
      .attr('width', d => d.width)
      .attr('height', d => d.height)
      .attr('x', d => -d.width / 2)
      .attr('y', d => -d.height / 2)
      .style('-webkit-touch-callout', 'none')
      .style('-webkit-user-select', 'none')
      .style('-khtml-user-select', 'none')
      .style('-moz-user-select', 'none')
      .style('-ms-user-select', 'none')
      .style('-o-user-select', 'none')
      .style('user-select', 'none')
      .style('opacity', 0.95)
      .style('pointer-events', 'none');
  }

  // Creates the second type of node which is the me node.
  // It's the one in the center with my headshot.
  createMeNode() {
    this.meNode = this.d3Graph.selectAll(null)
      .data(this.nodes.slice(8, 9))
      .enter()
      .append('g');

    // Adds my image to the node with functionality to toggle the
    // tooltip when clicked.
    this.meNode.append('svg:image')
      .attr('xlink:href', d => pathToImgs(`./${d.name}.png`, true))
      .attr('height', this.r * 2)
      .attr('width', this.r * 2)
      .attr('x', -(this.r))
      .attr('y', -(this.r))
      .style('cursor', 'pointer')
      .on('click', function toggleTooltip(d) {
        d.tooltip = !d.tooltip;

        if (d.tooltip) {
          d3.select(this.parentNode.parentNode).selectAll('.tooltip')
            .transition()
            .duration(300)
            .attr('opacity', 1)
            .style('-webkit-touch-callout', 'auto')
            .style('-webkit-user-select', 'auto')
            .style('-khtml-user-select', 'auto')
            .style('-moz-user-select', 'auto')
            .style('-ms-user-select', 'auto')
            .style('-o-user-select', 'auto')
            .style('user-select', 'auto')
            .style('pointer-events', 'auto');
        } else {
          d3.select(this.parentNode.parentNode).selectAll('.tooltip')
            .transition()
            .duration(300)
            .attr('opacity', 0)
            .style('-webkit-touch-callout', 'none')
            .style('-webkit-user-select', 'none')
            .style('-khtml-user-select', 'none')
            .style('-moz-user-select', 'none')
            .style('-ms-user-select', 'none')
            .style('-o-user-select', 'none')
            .style('user-select', 'none')
            .style('pointer-events', 'none');
        }
      });
  }

  createTooltip() {
    const width = 200;
    const height = 106;
    const startX = -(width / 2);
    const startY = this.r + 7;
    const curve = 10;

    // Creates an svg tooltip according to the specs above
    this.tooltipPath = d3.path();
    this.tooltipPath.moveTo(startX, startY + curve);
    this.tooltipPath.bezierCurveTo((startX), (startY),
      (startX + curve), (startY), (startX + curve), (startY));
    this.tooltipPath.lineTo((startX + ((width / 2) - 6)), (startY));
    this.tooltipPath.lineTo((startX + (width / 2)), (startY - 6));
    this.tooltipPath.lineTo((startX + ((width / 2) + 6)), (startY));
    this.tooltipPath.lineTo((startX + width + -curve), (startY));
    this.tooltipPath.bezierCurveTo((startX + width), (startY),
      (startX + width), (startY + curve), (startX + width), (startY + curve));
    this.tooltipPath.lineTo((startX + width), (startY + height + -curve));
    this.tooltipPath.bezierCurveTo((startX + width), (startY + height),
      (startX + width + -curve), (height + startY), (startX + width + -curve), (height + startY));
    this.tooltipPath.lineTo((startX + curve), (startY + height));
    this.tooltipPath.bezierCurveTo((startX), (startY + height),
      (startX), (startY + height + -curve), (startX), (startY + height + -curve));
    this.tooltipPath.closePath();

    // Adds the tooltip and it's content to my node
    this.meNode.append('path')
      .attr('class', 'tooltip')
      .attr('d', this.tooltipPath)
      .attr('fill', '#0D2438')
      .attr('stroke', '#2B4860')
      .style('filter', 'url(#dropShadow)');

    this.meNode
      .append('text')
      .attr('class', 'tooltip')
      .attr('x', -62)
      .attr('y', this.r + 41)
      .text('Will Christman')
      .attr('fill', '#FFFFFF')
      .attr('font-family', 'Open Sans')
      .attr('font-weight', 700)
      .attr('font-size', 17);

    this.meNode
      .append('text')
      .attr('class', 'tooltip')
      .attr('x', -80)
      .attr('y', this.r + 68)
      .text('👨‍💻 Full-stack developer')
      .attr('fill', '#B9C9D9')
      .attr('font-family', 'Open Sans')
      .attr('font-weight', 400)
      .attr('font-size', 15);

    this.meNode
      .append('text')
      .attr('class', 'tooltip')
      .attr('x', -80)
      .attr('y', this.r + 92)
      .text('📍 Palo Alto, CA')
      .attr('fill', '#B9C9D9')
      .attr('font-family', 'Open Sans')
      .attr('font-weight', 400)
      .attr('font-size', 15);

    d3.selectAll('.tooltip')
      .attr('opacity', 1);
  }

  enterClick() {
    setTimeout(() => {
      this.setState({
        visible: true,
      });
    }, 300);
  }

  render() {
    const { visible } = this.state;

    return (
      <div>
        <EnterBtn enterClick={this.enterClick} />
        <svg className={visible ? styles.containerVisible : styles.containerHidden} ref="graph" />
      </div>
    );
  }
}

export default Home;
